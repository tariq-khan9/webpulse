-- ============================================================
-- UPTIME MONITORING SAAS — FULL SCHEMA
-- ============================================================

-- ============================================================
-- MONITORS
-- ============================================================

CREATE TABLE monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    name TEXT NOT NULL,

    url TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'unknown'
        CHECK (status IN ('unknown', 'up', 'down')),

    is_paused BOOLEAN NOT NULL DEFAULT false,

    last_checked_at TIMESTAMPTZ,

    last_status_change_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT monitors_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    CONSTRAINT monitors_user_url_unique
        UNIQUE (user_id, url)
);

-- Index for quickly finding monitors belonging to a user
CREATE INDEX monitors_user_id_idx
ON monitors(user_id);

-- Index to help the worker quickly find active monitors due for a check
CREATE INDEX monitors_active_idx
ON monitors(id)
WHERE is_paused = false;


-- ============================================================
-- INCIDENTS
-- ============================================================

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    monitor_id UUID NOT NULL,

    started_at TIMESTAMPTZ NOT NULL,

    resolved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT incidents_monitor_id_fkey
        FOREIGN KEY (monitor_id)
        REFERENCES monitors(id)
        ON DELETE CASCADE,

    CONSTRAINT incidents_resolved_after_started_check
        CHECK (
            resolved_at IS NULL
            OR resolved_at >= started_at
        )
);

-- Index for quickly finding incidents belonging to a monitor
CREATE INDEX incidents_monitor_id_idx
ON incidents(monitor_id);

-- Index to quickly find the currently-open incident for a monitor (if any)
CREATE INDEX incidents_open_idx
ON incidents(monitor_id)
WHERE resolved_at IS NULL;


-- ============================================================
-- DAILY UPTIME
-- ============================================================

CREATE TABLE uptime_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    monitor_id UUID NOT NULL,

    date DATE NOT NULL,

    uptime_percentage NUMERIC(5,2) NOT NULL
        CHECK (
            uptime_percentage >= 0
            AND uptime_percentage <= 100
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uptime_daily_monitor_id_fkey
        FOREIGN KEY (monitor_id)
        REFERENCES monitors(id)
        ON DELETE CASCADE,

    CONSTRAINT uptime_daily_monitor_date_unique
        UNIQUE (monitor_id, date)
);

-- Index for finding uptime history for a monitor
CREATE INDEX uptime_daily_monitor_id_idx
ON uptime_daily(monitor_id);


-- ============================================================
-- SUBSCRIPTIONS (billing)
-- ============================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE,

    stripe_customer_id TEXT UNIQUE,

    stripe_subscription_id TEXT UNIQUE,

    status TEXT NOT NULL DEFAULT 'inactive'
        CHECK (status IN ('inactive', 'active', 'past_due', 'canceled')),

    monitor_limit INTEGER NOT NULL DEFAULT 0,

    current_period_end TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT subscriptions_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

CREATE INDEX subscriptions_user_id_idx
ON subscriptions(user_id);

-- Keep updated_at current on every row update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_set_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- ALERTS (notification log)
-- ============================================================

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    monitor_id UUID NOT NULL,

    incident_id UUID,

    type TEXT NOT NULL
        CHECK (type IN ('down', 'up')),

    sent_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT alerts_monitor_id_fkey
        FOREIGN KEY (monitor_id)
        REFERENCES monitors(id)
        ON DELETE CASCADE,

    CONSTRAINT alerts_incident_id_fkey
        FOREIGN KEY (incident_id)
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    -- Prevent duplicate alerts for the same incident + type (idempotency)
    CONSTRAINT alerts_incident_type_unique
        UNIQUE (incident_id, type)
);

CREATE INDEX alerts_monitor_id_idx
ON alerts(monitor_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Enforced so that even if a table is queried directly with a
-- user's JWT (e.g. from the browser via the Supabase client),
-- users can only ever see/modify their own data. If all access
-- goes through server-side API routes using the service role
-- key, RLS is bypassed there by design — but keep it on as a
-- safety net for any client-side or future public API usage.

-- MONITORS
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own monitors"
ON monitors FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monitors"
ON monitors FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monitors"
ON monitors FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own monitors"
ON monitors FOR DELETE
USING (auth.uid() = user_id);

-- INCIDENTS (access via ownership of the parent monitor)
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own incidents"
ON incidents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM monitors
        WHERE monitors.id = incidents.monitor_id
        AND monitors.user_id = auth.uid()
    )
);

-- UPTIME_DAILY (access via ownership of the parent monitor)
ALTER TABLE uptime_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uptime data"
ON uptime_daily FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM monitors
        WHERE monitors.id = uptime_daily.monitor_id
        AND monitors.user_id = auth.uid()
    )
);

-- SUBSCRIPTIONS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- ALERTS (access via ownership of the parent monitor)
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
ON alerts FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM monitors
        WHERE monitors.id = alerts.monitor_id
        AND monitors.user_id = auth.uid()
    )
);

-- NOTE: No client-side INSERT/UPDATE/DELETE policies are defined for
-- incidents, uptime_daily, subscriptions, or alerts. These tables should
-- only be written to by the background worker / Stripe webhook handler
-- using the Supabase service role key, which bypasses RLS entirely.
-- This is intentional: users should never be able to fabricate their own
-- uptime history, incidents, alerts, or subscription status.
