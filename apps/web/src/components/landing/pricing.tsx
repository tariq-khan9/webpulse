import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/landing/section-heading";

const plans = [
  {
    name: "Free",
    price: "$0",
    tagline: "For personal projects.",
    cta: "Start Free",
    highlighted: false,
    features: [
      "3 monitors",
      "5-minute checks",
      "Basic uptime monitoring",
      "Basic incident tracking",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    tagline: "For serious projects and small teams.",
    cta: "Start Monitoring",
    highlighted: true,
    features: [
      "25 monitors",
      "1-minute checks",
      "Incident management",
      "Advanced analytics",
      "Status pages",
      "Notifications",
    ],
  },
  {
    name: "Business",
    price: "$29",
    tagline: "For teams and growing products.",
    cta: "Get Started",
    highlighted: false,
    features: [
      "100 monitors",
      "Advanced monitoring",
      "Team features",
      "Extended analytics",
      "Multiple status pages",
      "Priority support",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing. No surprises."
          description="Start free and upgrade as your monitoring needs grow. Every plan includes fast, reliable checks."
        />

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 sm:p-8  ${
                plan.highlighted
                  ? "border-primary/50 bg-card glow-primary lg:-mt-4 lg:pb-12"
                  : "border-border bg-card/50"
              }
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/30">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-medium">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.tagline}
              </p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-mono text-4xl font-semibold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>

              <Button
                size="lg"
                nativeButton={false}
                variant={plan.highlighted ? "default" : "outline"}
                className={`mt-6 h-11 w-full rounded-xl text-sm  ${
                  plan.highlighted &&
                  "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90"
                }`}
                render={<a href="#" />}
              >
                {plan.cta}
              </Button>

              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full",
                        ${
                          plan.highlighted
                            ? "bg-primary/15 text-primary"
                            : "bg-success/10 text-success"
                        }`}
                    >
                      <Check className="size-3" />
                    </span>
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
