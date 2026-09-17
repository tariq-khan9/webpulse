import "server-only";

import Stripe from "stripe";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let client: Stripe | null = null;

// Created on first use rather than at import, so `next build` does not need
// Stripe keys just to collect page data.
export function getStripe(): Stripe {
  client ??= new Stripe(requireEnv("STRIPE_SECRET_KEY"));
  return client;
}

export const stripeEnv = {
  proPriceId: () => requireEnv("STRIPE_PRO_PRICE_ID"),
  webhookSecret: () => requireEnv("STRIPE_WEBHOOK_SECRET"),
};
