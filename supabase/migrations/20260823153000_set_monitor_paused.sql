-- ============================================================
-- SET_MONITOR_PAUSED
-- ============================================================
-- Pausing has to resolve any open incident, or a monitor paused mid-outage
-- accrues downtime forever. Users cannot do that themselves: incidents have
-- no client-side write policy, precisely so nobody can fabricate uptime.
--
-- SECURITY DEFINER lets this one narrow operation through, which means RLS is
-- bypassed and ownership must be checked inside the function.

CREATE OR REPLACE FUNCTION set_monitor_paused(
    p_monitor_id UUID,
    p_paused BOOLEAN
)
RETURNS VOID
AS $$
DECLARE
    v_owner UUID;
BEGIN
    SELECT user_id INTO v_owner
    FROM monitors
    WHERE id = p_monitor_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Monitor not found';
    END IF;

    IF v_owner IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorised to change this monitor';
    END IF;

    IF p_paused THEN
        UPDATE incidents
        SET resolved_at = now()
        WHERE monitor_id = p_monitor_id
          AND resolved_at IS NULL;
    END IF;

    -- Status resets because a paused monitor is no longer being observed.
    -- The first check after resuming then transitions from 'unknown', which
    -- cannot open a spurious incident or resolve one that never existed.
    UPDATE monitors
    SET is_paused = p_paused,
        status = 'unknown'
    WHERE id = p_monitor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Unlike record_check_result this is meant to be called by signed-in users,
-- so authenticated keeps EXECUTE. anon does not: there is no auth.uid() to
-- check ownership against.
REVOKE EXECUTE ON FUNCTION set_monitor_paused(UUID, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION set_monitor_paused(UUID, BOOLEAN) TO authenticated;
