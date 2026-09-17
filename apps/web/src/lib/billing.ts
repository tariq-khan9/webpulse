import "server-only";

import type Stripe from "stripe";

import { db } from "./db";
import { clearCache, syncSchedule } from "./schedule";
import { checkIntervalForSubscription, monitorLimitForSubscription } from "./tiers";

type SubscriptionStatus = "inactive" | "active" | "past_due" | "canceled";

// Collapses Stripe's statuses onto the four the subscriptions table allows.
function toSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "incomplete":
      return "inactive";
    default:
      return "canceled";
  }
}

// Makes the database match a Stripe subscription. Always given the freshly
// retrieved object rather than the webhook payload, so events arriving out of
// order still converge on Stripe's current state. Safe to run repeatedly.
export async function syncSubscription(subscription: Stripe.Subscription): Promise<void> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const row = await db.subscription.findUnique({
    where: { stripeCustomerId: customerId },
    select: { userId: true, stripeSubscriptionId: true },
  });

  // The customer is saved before checkout starts, so an unknown one did not
  // come from this app (e.g. created by hand in the Stripe dashboard).
  if (!row) {
    console.warn("Ignoring subscription for unknown Stripe customer", { customerId });
    return;
  }

  const status = toSubscriptionStatus(subscription.status);

  // A late event for an old, ended subscription must not downgrade a user who
  // has since subscribed again.
  if (
    row.stripeSubscriptionId &&
    row.stripeSubscriptionId !== subscription.id &&
    status !== "active"
  ) {
    return;
  }

  const periodEnd = subscription.items.data[0]?.current_period_end;

  await db.$executeRaw`
    SELECT apply_subscription(
      ${row.userId},
      ${status},
      ${monitorLimitForSubscription(status)}::integer,
      ${checkIntervalForSubscription(status)}::integer,
      ${subscription.id},
      ${periodEnd ? new Date(periodEnd * 1000) : null}::timestamptz
    )
  `;

  await syncUserSchedules(row.userId);
}

// The check rate changed for every monitor, and a downgrade may have paused
// some, so each schedule in Redis is brought in line with its row.
async function syncUserSchedules(userId: string): Promise<void> {
  let monitors;
  try {
    monitors = await db.monitor.findMany({
      where: { userId },
      select: { id: true, isPaused: true, checkIntervalSeconds: true },
    });
  } catch (error) {
    // Not fatal: the database is already correct and the worker's hourly
    // reconcile applies it to Redis.
    console.error("Could not load monitors to resync schedules", { userId, error });
    return;
  }

  for (const monitor of monitors) {
    if (monitor.isPaused) {
      await syncSchedule(monitor.id, null);
      await clearCache(monitor.id);
    } else {
      await syncSchedule(monitor.id, monitor.checkIntervalSeconds);
    }
  }
}
