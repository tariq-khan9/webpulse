-- ============================================================
-- MONITORING ENGINE — v1 schema additions
-- ============================================================

-- ============================================================
-- MONITORS — check configuration
-- ============================================================

ALTER TABLE monitors
    ADD COLUMN method TEXT NOT NULL DEFAULT 'GET'
        CHECK (method IN ('GET', 'HEAD', 'POST')),

    ADD COLUMN timeout_ms INTEGER NOT NULL DEFAULT 10000
        CHECK (timeout_ms > 0),

    ADD COLUMN check_interval_seconds INTEGER NOT NULL DEFAULT 300
        CHECK (check_interval_seconds > 0);


-- ============================================================
-- INCIDENTS — diagnostics
-- ============================================================

ALTER TABLE incidents
    ADD COLUMN status_code INTEGER
        CHECK (status_code IS NULL OR (status_code >= 100 AND status_code < 600)),

    ADD COLUMN error_message TEXT;


-- ============================================================
-- UPTIME_DAILY — average response time
-- ============================================================

ALTER TABLE uptime_daily
    ADD COLUMN avg_response_ms INTEGER
        CHECK (avg_response_ms IS NULL OR avg_response_ms >= 0);


-- ============================================================
-- SUBSCRIPTIONS — auto-create a free-tier row at signup
-- ============================================================
-- Without this, monitor_limit is undefined (no row at all) for new users.
-- Free tier: 3 monitors, no Stripe subscription (status keeps its default 'inactive').

CREATE OR REPLACE FUNCTION create_subscription_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (user_id, monitor_limit)
    VALUES (NEW.id, 3);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_subscription_for_new_user();


-- ============================================================
-- MONITORS — enforce subscriptions.monitor_limit on insert
-- ============================================================
-- Without this, a user can insert unlimited monitors straight past the paywall.

CREATE OR REPLACE FUNCTION enforce_monitor_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_limit INTEGER;
    monitor_count INTEGER;
BEGIN
    SELECT monitor_limit INTO user_limit
    FROM public.subscriptions
    WHERE user_id = NEW.user_id;

    IF user_limit IS NULL THEN
        RAISE EXCEPTION 'No subscription found for user %', NEW.user_id;
    END IF;

    SELECT count(*) INTO monitor_count
    FROM public.monitors
    WHERE user_id = NEW.user_id;

    IF monitor_count >= user_limit THEN
        RAISE EXCEPTION 'Monitor limit reached (% of %)', monitor_count, user_limit;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER monitors_enforce_limit
BEFORE INSERT ON monitors
FOR EACH ROW
EXECUTE FUNCTION enforce_monitor_limit();
