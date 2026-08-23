-- ============================================================
-- CHECK RESULT RECORDING
-- ============================================================

-- At most one open incident per monitor, enforced by the database instead of
-- by careful application code. Replaces the plain index with a unique one.
DROP INDEX IF EXISTS incidents_open_idx;

CREATE UNIQUE INDEX incidents_one_open_idx
ON incidents(monitor_id)
WHERE resolved_at IS NULL;


-- Records one check outcome. The worker calls this only when it believes the
-- status changed, but the function re-reads the monitor's real status so it
-- stays correct even when the Redis cache was empty or wrong.
CREATE OR REPLACE FUNCTION record_check_result(
    p_monitor_id UUID,
    p_status TEXT,
    p_status_code INTEGER,
    p_error_message TEXT,
    p_checked_at TIMESTAMPTZ
)
RETURNS TEXT
AS $$
DECLARE
    v_previous_status TEXT;
    v_outcome TEXT := 'no_change';
BEGIN
    -- Lock the monitor row so two overlapping checks cannot both conclude the
    -- status changed and open two incidents.
    SELECT status INTO v_previous_status
    FROM monitors
    WHERE id = p_monitor_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN 'monitor_missing';
    END IF;

    IF p_status = 'down' AND v_previous_status <> 'down' THEN
        INSERT INTO incidents (monitor_id, started_at, status_code, error_message)
        VALUES (p_monitor_id, p_checked_at, p_status_code, p_error_message);
        v_outcome := 'incident_opened';

    ELSIF p_status = 'up' AND v_previous_status = 'down' THEN
        UPDATE incidents
        SET resolved_at = p_checked_at
        WHERE monitor_id = p_monitor_id
          AND resolved_at IS NULL;
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

    RETURN v_outcome;
END;
$$ LANGUAGE plpgsql;


-- Supabase exposes public-schema functions over its API, and Postgres grants
-- EXECUTE to PUBLIC by default. Without this, any logged-in user could call
-- the function directly and fabricate their own incidents and uptime.
REVOKE EXECUTE ON FUNCTION record_check_result(UUID, TEXT, INTEGER, TEXT, TIMESTAMPTZ)
    FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION record_check_result(UUID, TEXT, INTEGER, TEXT, TIMESTAMPTZ)
    TO service_role;
