import { CircleCheck } from "lucide-react";
import { UptimeBars } from "@/components/landing/charts";
import { SectionHeading } from "@/components/landing/section-heading";
import { Logo } from "@/components/logo";

const services = [
  { name: "Website", uptime: "99.99%" },
  { name: "API", uptime: "99.98%" },
  { name: "Dashboard", uptime: "100%" },
  { name: "Authentication", uptime: "99.97%" },
];

const history = Array.from({ length: 40 }, (_, i) =>
  [11, 29].includes(i) ? 0.97 : 1,
);

export function StatusPage() {
  return (
    <section id="status" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Status Pages"
          title="Keep your users informed."
          description="Give customers a clear view of your service health with a simple public status page."
        />

        <div className="relative mx-auto mt-14 max-w-3xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-b from-success/10 to-transparent blur-2xl"
          />
          <div className="overflow-hidden rounded-2xl border border-border glass shadow-xl shadow-black/30">
            {/* status header */}
            <div className="flex flex-col items-center gap-4 border-b border-border bg-gradient-to-b from-success/10 to-transparent p-8 text-center">
              <div className="flex items-center justify-between self-stretch">
                <Logo />
                <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                  WebPulse Status
                </span>
              </div>
              <div className="mt-2 flex size-14 items-center justify-center rounded-full bg-success/15">
                <CircleCheck className="size-7 text-success" />
              </div>
              <div>
                <p className="text-xl font-semibold">All Systems Operational</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Updated just now · 99.99% uptime this month
                </p>
              </div>
            </div>

            {/* services */}
            <div className="divide-y divide-border">
              {services.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-success pulse-dot" />
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                      {s.uptime}
                    </span>
                    <span className="text-sm text-success">Operational</span>
                  </div>
                </div>
              ))}
            </div>

            {/* uptime history */}
            <div className="border-t border-border p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Uptime history</p>
                <span className="text-xs text-muted-foreground">
                  Last 90 days
                </span>
              </div>
              <div className="mt-3 h-8">
                <UptimeBars data={history} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
