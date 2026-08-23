// Check frequency is a paid perk, so it is derived from the subscription
// rather than chosen by the user. The worker reads whatever value ends up on
// the monitor row, so changing a tier here needs no migration.
export const FREE_CHECK_INTERVAL_SECONDS = 300;
export const PAID_CHECK_INTERVAL_SECONDS = 60;

export function checkIntervalForSubscription(
  subscriptionStatus: string | null,
): number {
  return subscriptionStatus === "active"
    ? PAID_CHECK_INTERVAL_SECONDS
    : FREE_CHECK_INTERVAL_SECONDS;
}
