-- ============================================================
-- RECORD_CHECK_RESULT — RETURN THE INCIDENT ID
-- ============================================================
-- Alerts are deduplicated on (incident_id, type), so the worker needs the id
-- of the incident it just opened or resolved. Returning it from the same
-- transaction avoids a follow-up query that could race with another check.

DROP FUNCTION IF EXISTS record_check_result(UUID, TEXT, TIMESTAMPTZ, INTEGER, TEXT);

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


-- Supabase exposes public-schema functions over its API, and Postgres grants
-- EXECUTE to PUBLIC by default. Without this, any logged-in user could call
-- the function directly and fabricate their own incidents and uptime.
REVOKE EXECUTE ON FUNCTION record_check_result(UUID, TEXT, TIMESTAMPTZ, INTEGER, TEXT)
    FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION record_check_result(UUID, TEXT, TIMESTAMPTZ, INTEGER, TEXT)
    TO service_role;
