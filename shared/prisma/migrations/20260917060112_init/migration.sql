-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ,
    "refresh_token_expires_at" TIMESTAMPTZ,
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unknown',
    "is_paused" BOOLEAN NOT NULL DEFAULT false,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "timeout_ms" INTEGER NOT NULL DEFAULT 10000,
    "check_interval_seconds" INTEGER NOT NULL DEFAULT 300,
    "last_checked_at" TIMESTAMPTZ,
    "last_status_change_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "monitor_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL,
    "resolved_at" TIMESTAMPTZ,
    "status_code" INTEGER,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uptime_daily" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "monitor_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "uptime_percentage" DECIMAL(5,2) NOT NULL,
    "avg_response_ms" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uptime_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "monitor_id" UUID NOT NULL,
    "incident_id" UUID,
    "type" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "monitor_limit" INTEGER NOT NULL DEFAULT 3,
    "current_period_end" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- CreateIndex
CREATE INDEX "monitors_user_id_idx" ON "monitors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "monitors_user_id_url_key" ON "monitors"("user_id", "url");

-- CreateIndex
CREATE INDEX "incidents_monitor_id_idx" ON "incidents"("monitor_id");

-- CreateIndex
CREATE UNIQUE INDEX "uptime_daily_monitor_id_date_key" ON "uptime_daily"("monitor_id", "date");

-- CreateIndex
CREATE INDEX "alerts_monitor_id_idx" ON "alerts"("monitor_id");

-- CreateIndex
CREATE UNIQUE INDEX "alerts_incident_id_type_key" ON "alerts"("incident_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_customer_id_key" ON "subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitors" ADD CONSTRAINT "monitors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uptime_daily" ADD CONSTRAINT "uptime_daily_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ============================================================
-- Hand-written: rules schema.prisma cannot express.
-- Keep these when generating future migrations.
-- ============================================================

-- CHECK constraints ------------------------------------------

ALTER TABLE "monitors"
    ADD CONSTRAINT "monitors_status_check" CHECK ("status" IN ('unknown', 'up', 'down')),
    ADD CONSTRAINT "monitors_method_check" CHECK ("method" IN ('GET', 'HEAD', 'POST')),
    ADD CONSTRAINT "monitors_timeout_ms_check" CHECK ("timeout_ms" > 0),
    ADD CONSTRAINT "monitors_check_interval_seconds_check" CHECK ("check_interval_seconds" > 0);

ALTER TABLE "incidents"
    ADD CONSTRAINT "incidents_resolved_after_started_check"
        CHECK ("resolved_at" IS NULL OR "resolved_at" >= "started_at"),
    ADD CONSTRAINT "incidents_status_code_check"
        CHECK ("status_code" IS NULL OR ("status_code" >= 100 AND "status_code" < 600));

ALTER TABLE "uptime_daily"
    ADD CONSTRAINT "uptime_daily_uptime_percentage_check"
        CHECK ("uptime_percentage" >= 0 AND "uptime_percentage" <= 100),
    ADD CONSTRAINT "uptime_daily_avg_response_ms_check"
        CHECK ("avg_response_ms" IS NULL OR "avg_response_ms" >= 0);

ALTER TABLE "alerts"
    ADD CONSTRAINT "alerts_type_check" CHECK ("type" IN ('down', 'up'));

ALTER TABLE "subscriptions"
    ADD CONSTRAINT "subscriptions_status_check"
        CHECK ("status" IN ('inactive', 'active', 'past_due', 'canceled'));

-- At most one open incident per monitor, enforced by the database instead of
-- by careful application code.
CREATE UNIQUE INDEX "incidents_one_open_idx"
    ON "incidents" ("monitor_id")
    WHERE "resolved_at" IS NULL;


-- Free-plan subscription row for every new user --------------

-- Without a row, monitor_limit is undefined and every monitor insert fails.
-- A trigger rather than app code, so no signup path can skip it.
CREATE FUNCTION create_subscription_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO subscriptions (user_id, monitor_limit, updated_at)
    VALUES (NEW.id, 3, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_create_subscription
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_subscription_for_new_user();


-- Enforce subscriptions.monitor_limit on insert ---------------

CREATE FUNCTION enforce_monitor_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_limit INTEGER;
    v_count INTEGER;
BEGIN
    -- Locking the subscription row serialises concurrent inserts for the same
    -- user, so two requests cannot both pass the count below.
    SELECT monitor_limit INTO v_limit
    FROM subscriptions
    WHERE user_id = NEW.user_id
    FOR UPDATE;

    IF v_limit IS NULL THEN
        RAISE EXCEPTION 'No subscription found for user %', NEW.user_id;
    END IF;

    SELECT count(*) INTO v_count
    FROM monitors
    WHERE user_id = NEW.user_id;

    IF v_count >= v_limit THEN
        RAISE EXCEPTION 'Monitor limit reached (% of %)', v_count, v_limit;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER monitors_enforce_limit
BEFORE INSERT ON monitors
FOR EACH ROW
EXECUTE FUNCTION enforce_monitor_limit();


-- record_check_result -----------------------------------------

-- Records one check outcome. The worker calls this only when it believes the
-- status changed, but the function re-reads the monitor's real status so it
-- stays correct even when the Redis cache was empty or wrong. Returns the
-- incident it opened or resolved, so alerts can be deduplicated on it.
CREATE FUNCTION record_check_result(
    p_monitor_id UUID,
    p_status TEXT,
    p_checked_at TIMESTAMPTZ,
    p_status_code INTEGER DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS JSONB
AS $$
DECLARE
    v_previous_status TEXT;
    v_outcome TEXT := 'no_change';
    v_incident_id UUID;
BEGIN
    -- Lock the monitor row so two overlapping checks cannot both conclude the
    -- status changed and open two incidents.
    SELECT status INTO v_previous_status
    FROM monitors
    WHERE id = p_monitor_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('outcome', 'monitor_missing', 'incident_id', NULL);
    END IF;

    IF p_status = 'down' AND v_previous_status <> 'down' THEN
        INSERT INTO incidents (monitor_id, started_at, status_code, error_message)
        VALUES (p_monitor_id, p_checked_at, p_status_code, p_error_message)
        RETURNING id INTO v_incident_id;
        v_outcome := 'incident_opened';

    ELSIF p_status = 'up' AND v_previous_status = 'down' THEN
        UPDATE incidents
        SET resolved_at = p_checked_at
        WHERE monitor_id = p_monitor_id
          AND resolved_at IS NULL
        RETURNING id INTO v_incident_id;
        v_outcome := 'incident_resolved';
    END IF;

    UPDATE monitors
    SET status = p_status,
        last_checked_at = p_checked_at,
        last_status_change_at = CASE
            WHEN status IS DISTINCT FROM p_status THEN p_checked_at
            ELSE last_status_change_at
        END
    WHERE id = p_monitor_id;

    RETURN jsonb_build_object('outcome', v_outcome, 'incident_id', v_incident_id);
END;
$$ LANGUAGE plpgsql;


-- set_monitor_paused ------------------------------------------

-- Pausing has to resolve any open incident, or a monitor paused mid-outage
-- accrues downtime forever. Resuming respects the plan limit, so a user
-- downgraded to Free cannot resume monitors that apply_subscription paused.
-- p_user_id is the signed-in caller; a monitor they do not own is reported
-- as not found.
CREATE FUNCTION set_monitor_paused(
    p_monitor_id UUID,
    p_user_id TEXT,
    p_paused BOOLEAN
)
RETURNS VOID
AS $$
DECLARE
    v_limit INTEGER;
    v_active INTEGER;
BEGIN
    PERFORM 1
    FROM monitors
    WHERE id = p_monitor_id
      AND user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Monitor not found';
    END IF;

    IF p_paused THEN
        UPDATE incidents
        SET resolved_at = now()
        WHERE monitor_id = p_monitor_id
          AND resolved_at IS NULL;
    ELSE
        SELECT monitor_limit INTO v_limit
        FROM subscriptions
        WHERE user_id = p_user_id
        FOR UPDATE;

        SELECT count(*) INTO v_active
        FROM monitors
        WHERE user_id = p_user_id
          AND is_paused = false
          AND id <> p_monitor_id;

        IF v_active >= COALESCE(v_limit, 0) THEN
            RAISE EXCEPTION 'Monitor limit reached (% of %)', v_active, v_limit;
        END IF;
    END IF;

    -- Status resets because a paused monitor is no longer being observed.
    -- The first check after resuming then transitions from 'unknown', which
    -- cannot open a spurious incident or resolve one that never existed.
    UPDATE monitors
    SET is_paused = p_paused,
        status = 'unknown'
    WHERE id = p_monitor_id;
END;
$$ LANGUAGE plpgsql;


-- record_daily_uptime -----------------------------------------

-- Uptime is derived from incident timestamps rather than sampled, so a day's
-- figure is exact: sum the parts of each incident that fall inside the day.
-- Days are UTC, matching the worker's schedule. avg_response_ms is supplied
-- by the caller because response samples live in Redis.
CREATE FUNCTION record_daily_uptime(
    p_monitor_id UUID,
    p_date DATE,
    p_avg_response_ms INTEGER DEFAULT NULL
)
RETURNS NUMERIC
AS $$
DECLARE
    v_start TIMESTAMPTZ := p_date::TIMESTAMPTZ;
    v_end   TIMESTAMPTZ := (p_date + 1)::TIMESTAMPTZ;
    v_down_seconds NUMERIC;
    v_uptime NUMERIC;
BEGIN
    -- An incident still open at midnight counts only up to the end of the day.
    SELECT COALESCE(SUM(
        EXTRACT(EPOCH FROM (
            LEAST(COALESCE(resolved_at, v_end), v_end)
            - GREATEST(started_at, v_start)
        ))
    ), 0)
    INTO v_down_seconds
    FROM incidents
    WHERE monitor_id = p_monitor_id
      AND started_at < v_end
      AND COALESCE(resolved_at, v_end) > v_start;

    v_uptime := ROUND(
        GREATEST(0, LEAST(100, (1 - v_down_seconds / 86400) * 100))::NUMERIC,
        2
    );

    INSERT INTO uptime_daily (monitor_id, date, uptime_percentage, avg_response_ms)
    VALUES (p_monitor_id, p_date, v_uptime, p_avg_response_ms)
    ON CONFLICT (monitor_id, date) DO UPDATE
        SET uptime_percentage = EXCLUDED.uptime_percentage,
            avg_response_ms   = EXCLUDED.avg_response_ms;

    RETURN v_uptime;
END;
$$ LANGUAGE plpgsql;


-- apply_subscription ------------------------------------------

-- Called by the Stripe webhook whenever a subscription is created, changed or
-- ends. Plan limits are passed in, so apps/web/src/lib/tiers.ts stays the
-- single definition of each tier. On a downgrade, monitors beyond the new
-- limit are paused rather than deleted: the oldest keep running.
CREATE FUNCTION apply_subscription(
    p_user_id TEXT,
    p_status TEXT,
    p_monitor_limit INTEGER,
    p_check_interval_seconds INTEGER,
    p_stripe_subscription_id TEXT,
    p_current_period_end TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
AS $$
BEGIN
    UPDATE subscriptions
    SET status = p_status,
        monitor_limit = p_monitor_limit,
        stripe_subscription_id = p_stripe_subscription_id,
        current_period_end = p_current_period_end,
        updated_at = now()
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No subscription row for user %', p_user_id;
    END IF;

    -- Paused monitors are updated too, so a later resume uses the right rate.
    UPDATE monitors
    SET check_interval_seconds = p_check_interval_seconds
    WHERE user_id = p_user_id;

    WITH extras AS (
        SELECT id
        FROM monitors
        WHERE user_id = p_user_id
          AND is_paused = false
        ORDER BY created_at, id
        OFFSET p_monitor_limit
    ),
    resolved AS (
        UPDATE incidents
        SET resolved_at = now()
        WHERE resolved_at IS NULL
          AND monitor_id IN (SELECT id FROM extras)
    )
    UPDATE monitors
    SET is_paused = true,
        status = 'unknown'
    WHERE id IN (SELECT id FROM extras);
END;
$$ LANGUAGE plpgsql;
