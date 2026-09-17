import type Stripe from "stripe";

import { syncSubscription } from "@/lib/billing";
import { getStripe, stripeEnv } from "@/lib/stripe";

const SUBSCRIPTION_EVENTS = new Set<Stripe.Event.Type>([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const stripe = getStripe();

  // Verification needs the exact raw body, so it is read as text, not JSON.
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      stripeEnv.webhookSecret(),
    );
  } catch {
    return new Response("Invalid Stripe signature", { status: 400 });
  }

  if (!SUBSCRIPTION_EVENTS.has(event.type)) {
    return Response.json({ received: true });
  }

  try {
    const { id } = event.data.object as Stripe.Subscription;
    // Re-fetched so a delayed or out-of-order event cannot apply stale state.
    const subscription = await stripe.subscriptions.retrieve(id);
    await syncSubscription(subscription);
  } catch (error) {
    console.error("Stripe webhook processing failed", { eventId: event.id, error });
    // A non-2xx response makes Stripe retry the event later.
    return new Response("Webhook processing failed", { status: 500 });
  }

  return Response.json({ received: true });
}
