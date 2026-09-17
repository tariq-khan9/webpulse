"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { getStripe, stripeEnv } from "@/lib/stripe";

const billingUrl = () => `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`;

// Every user gets exactly one Stripe customer, saved before checkout so the
// webhook can map subscription events back to the user.
async function getOrCreateCustomerId(userId: string, email: string): Promise<string> {
  const row = await db.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  if (row?.stripeCustomerId) return row.stripeCustomerId;

  const customer = await getStripe().customers.create({
    email,
    metadata: { user_id: userId },
  });

  // Written only if still empty, so two checkouts started at once cannot
  // leave the user attached to two different customers.
  await db.subscription.updateMany({
    where: { userId, stripeCustomerId: null },
    data: { stripeCustomerId: customer.id },
  });

  const saved = await db.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  if (!saved?.stripeCustomerId) {
    throw new Error("Could not save the Stripe customer");
  }

  return saved.stripeCustomerId;
}

export async function startCheckoutAction(): Promise<void> {
  const { user } = await requireSession();

  const subscription = await db.subscription.findUnique({
    where: { userId: user.id },
    select: { status: true, stripeSubscriptionId: true },
  });

  // A subscription that still exists in Stripe (including one with a failed
  // payment) is fixed in the portal, not by paying for a second one.
  if (
    subscription?.stripeSubscriptionId &&
    (subscription.status === "active" || subscription.status === "past_due")
  ) {
    return openBillingPortalAction();
  }

  const customerId = await getOrCreateCustomerId(user.id, user.email);

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: stripeEnv.proPriceId(), quantity: 1 }],
    success_url: `${billingUrl()}?checkout=success`,
    cancel_url: billingUrl(),
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");

  redirect(session.url);
}

export async function openBillingPortalAction(): Promise<void> {
  const { user } = await requireSession();

  const subscription = await db.subscription.findUnique({
    where: { userId: user.id },
    select: { stripeCustomerId: true },
  });

  if (!subscription?.stripeCustomerId) redirect("/dashboard/billing");

  const session = await getStripe().billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: billingUrl(),
  });

  redirect(session.url);
}
