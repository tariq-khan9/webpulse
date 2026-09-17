// Check frequency is a paid perk, so it is derived from the subscription
// rather than chosen by the user. The worker reads whatever value ends up on
// the monitor row, so changing a tier here needs no migration.
export const FREE_CHECK_INTERVAL_SECONDS = 300;
export const PAID_CHECK_INTERVAL_SECONDS = 60;

export const FREE_MONITOR_LIMIT = 3;
export const PAID_MONITOR_LIMIT = 30;

// Only a fully paid-up subscription is Pro. A failed payment (past_due)
// drops the user to Free straight away.
export function isPaidStatus(subscriptionStatus: string | null): boolean {
  return subscriptionStatus === "active";
}

export function checkIntervalForSubscription(
  subscriptionStatus: string | null,
): number {
  return isPaidStatus(subscriptionStatus)
    ? PAID_CHECK_INTERVAL_SECONDS
    : FREE_CHECK_INTERVAL_SECONDS;
}

export function monitorLimitForSubscription(
  subscriptionStatus: string | null,
): number {
  return isPaidStatus(subscriptionStatus) ? PAID_MONITOR_LIMIT : FREE_MONITOR_LIMIT;
}
