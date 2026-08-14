import { Plus, Timer, BellRing } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const steps = [
  {
    num: "01",
    icon: Plus,
    title: "Add your website",
    text: "Enter the URL you want WebPulse to monitor. No agents or code changes required.",
  },
  {
    num: "02",
    icon: Timer,
    title: "Choose your monitoring interval",
    text: "Select how frequently WebPulse should check your website — from every minute to every hour.",
  },
  {
    num: "03",
    icon: BellRing,
    title: "Get notified when something goes wrong",
    text: "WebPulse detects downtime, alerts you instantly, and keeps track of the incident until it is resolved.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="How It Works"
          title="Start monitoring in minutes."
          description="Three simple steps to full visibility over your websites."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="relative rounded-2xl border border-border bg-card/50 p-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-background/60">
                  <s.icon className="size-5 text-primary" />
                </span>
                <span className="font-mono text-2xl font-semibold text-muted-foreground/30">
                  {s.num}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.text}
              </p>
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="absolute -right-2 top-1/2 hidden size-4 -translate-y-1/2 rotate-45 border-r border-t border-border bg-background md:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
