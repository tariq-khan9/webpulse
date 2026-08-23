-- ============================================================
-- BACKFILL MISSING SUBSCRIPTIONS
-- ============================================================
-- on_auth_user_created only fires for users created after it existed, so any
-- user who signed up before that migration has no subscriptions row. Without
-- one, enforce_monitor_limit rejects every monitor insert for that user.

INSERT INTO subscriptions (user_id, monitor_limit)
SELECT u.id, 3
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions s WHERE s.user_id = u.id
);
