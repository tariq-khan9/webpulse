import React from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import {
  FREE_MONITOR_LIMIT,
  isPaidStatus,
  PAID_MONITOR_LIMIT,
} from "@/lib/tiers";
import { openBillingPortalAction, startCheckoutAction } from "./billing-actions";

const cardClass =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/40";

const buttonClass =
  "h-11 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-opacity hover:opacity-90";

const proFeatures = [
  `${PAID_MONITOR_LIMIT} monitors`,
  "1-minute checks",
  "Down & recovery emails",
  "Incident history and uptime charts",
];

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) => {
  const { checkout } = await searchParams;
  const { user } = await requireSession();

  const subscription = await db.subscription.findUnique({
    where: { userId: user.id },
    select: { status: true, stripeCustomerId: true, currentPeriodEnd: true },
  });

  const isPro = isPaidStatus(subscription?.status ?? null);
  const isPastDue = subscription?.status === "past_due";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="mt-1 text-sm text-slate-400">Your plan and payment details.</p>
      </header>

      {/* The webhook usually lands within seconds of Stripe's redirect back. */}
      {checkout === "success" && !isPro ? (
        <p className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-2.5 text-sm text-indigo-300">
          Payment received. Your plan will update in a few seconds — refresh
          this page if it has not.
        </p>
      ) : null}

      {isPastDue ? (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400">
          Your last payment failed, so your account is on the Free plan. Update
          your payment method to restore Pro. Paused monitors can be resumed
          once it goes through.
        </p>
      ) : null}

      <section className={cardClass}>
        <p className="text-sm text-slate-400">Current plan</p>
        <p className="mt-1 text-xl font-semibold text-white">
          {isPro ? "Pro" : "Free"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {isPro
            ? `${PAID_MONITOR_LIMIT} monitors, checked every minute.`
            : `${FREE_MONITOR_LIMIT} monitors, checked every 5 minutes.`}
          {isPro && subscription?.currentPeriodEnd
            ? ` Renews ${subscription.currentPeriodEnd.toLocaleDateString()}.`
            : ""}
        </p>

        {subscription?.stripeCustomerId ? (
          <form action={openBillingPortalAction} className="mt-5">
            <Button
              type="submit"
              variant="outline"
              className="h-11 rounded-full border-white/10 bg-white/5 px-6 text-slate-300 hover:bg-white/10"
            >
              Manage billing
            </Button>
          </form>
        ) : null}
      </section>

      {isPro ? null : (
        <section className={cardClass}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">Upgrade to Pro</h2>
            <p className="text-sm text-slate-400">
              <span className="text-2xl font-semibold text-white">$9</span> / month
            </p>
          </div>

          <ul className="mt-4 space-y-2">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-300">
                <Check className="h-4 w-4 text-indigo-400" />
                {feature}
              </li>
            ))}
          </ul>

          <form action={startCheckoutAction} className="mt-6">
            <Button type="submit" className={buttonClass}>
              {isPastDue ? "Fix payment" : "Upgrade to Pro"}
            </Button>
          </form>
        </section>
      )}
    </div>
  );
};

export default Page;
