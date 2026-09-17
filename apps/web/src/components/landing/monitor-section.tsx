import { Check, Timer, Signal, Gauge, Zap, Settings2 } from "lucide-react";
import { LineChart } from "@/components/landing/charts";

const benefits = [
  { icon: Timer, text: "1- or 5-minute check intervals" },
  { icon: Signal, text: "HTTP status monitoring" },
  { icon: Gauge, text: "Response-time tracking" },
  { icon: Zap, text: "Automatic incident detection" },
  { icon: Settings2, text: "Simple configuration" },
];

const timeline = [
  {
    label: "Operational",
    color: "bg-success",
    text: "text-success",
    time: "14:02",
  },
  {
    label: "Down",
    color: "bg-destructive",
    text: "text-destructive",
    time: "14:07",
  },
  {
    label: "Recovered",
    color: "bg-success",
    text: "text-success",
    time: "14:11",
  },
];

export function MonitorSection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        {/* Left visual */}
        <div className="order-2 lg:order-1">
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-2xl"
            />
            <div className="rounded-2xl border border-border glass p-5 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">mystore.com</span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  Checking every 60s
                </span>
              </div>

              <div className="mt-4 h-28 rounded-xl border border-border bg-background/50 p-3">
                <LineChart
                  data={[150, 158, 162, 170, 900, 60, 148, 152, 160, 155]}
                  color="var(--chart-1)"
                />
              </div>

              {/* status transition */}
              <div className="mt-5 flex items-center justify-between gap-2">
                {timeline.map((t, i) => (
                  <div key={t.label} className="flex flex-1 items-center gap-2">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`size-2.5 rounded-full ${t.color}`} />
                      <span className={`text-[11px] font-medium ${t.text}`}>
                        {t.label}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {t.time}
                      </span>
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="mb-5 h-px flex-1 bg-gradient-to-r from-border to-border/40" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right copy */}
        <div className="order-1 lg:order-2">
          <span className="inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-primary">
            Uptime Monitoring
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Know the moment something breaks.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            WebPulse checks your websites around the clock and
            emails you the moment they go down — so you find out before your users
            do.
          </p>

          <ul className="mt-8 space-y-3">
            {benefits.map((b) => (
              <li key={b.text} className="flex items-center gap-3">
                <span className="flex size-6 items-center justify-center rounded-md bg-success/10">
                  <Check className="size-3.5 text-success" />
                </span>
                <span className="text-sm text-foreground/90">{b.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
