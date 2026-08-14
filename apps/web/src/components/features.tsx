import {
  MonitorCheck,
  TriangleAlert,
  ChartLine,
  Globe,
  Server,
} from "lucide-react";
import { LineChart } from "@/components/charts";
import { SectionHeading } from "@/components/section-heading";

function CardShell({
  className,
  icon: Icon,
  title,
  description,
  children,
}: {
  className?: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`
        group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/50 p-6 transition-colors hover:border-primary/40
        
      `}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background/60">
          <Icon className="size-4 text-primary" />
        </span>
        <h3 className="text-base font-medium">{title}</h3>
      </div>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children && <div className="mt-5 flex-1">{children}</div>}
    </div>
  );
}

const smallMonitors = [
  { name: "api.webpulse.dev", up: true },
  { name: "example.com", up: true },
  { name: "dashboard.io", up: true },
  { name: "mystore.com", up: false },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to stay online."
          description="From simple uptime checks to detailed incident tracking, WebPulse gives you the visibility you need without unnecessary complexity."
        />

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-6">
          {/* Feature 1 — Uptime Monitoring (wide) */}
          <CardShell
            className="lg:col-span-4"
            icon={MonitorCheck}
            title="Uptime Monitoring"
            description="Monitor your websites at regular intervals and track uptime, response time, and status in real time."
          >
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <span className="font-mono text-sm">api.webpulse.dev</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs text-success">
                  <span className="size-1.5 rounded-full bg-success pulse-dot" />
                  Operational
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <dt className="text-[11px] text-muted-foreground">
                    Frequency
                  </dt>
                  <dd className="mt-1 font-mono text-sm">1 min</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted-foreground">Uptime</dt>
                  <dd className="mt-1 font-mono text-sm text-success">
                    99.99%
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted-foreground">
                    Response
                  </dt>
                  <dd className="mt-1 font-mono text-sm">96 ms</dd>
                </div>
              </dl>
            </div>
          </CardShell>

          {/* Feature 2 — Incident detection */}
          <CardShell
            className="lg:col-span-2"
            icon={TriangleAlert}
            title="Instant Incident Detection"
            description="Get an incident the moment a check fails."
          >
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-2">
                <TriangleAlert className="size-4 text-destructive" />
                <span className="text-sm font-medium">
                  API is experiencing downtime
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs text-warning">
                  Investigating
                </span>
                <span className="text-xs text-muted-foreground">
                  2 minutes ago
                </span>
              </div>
            </div>
          </CardShell>

          {/* Feature 3 — Response time analytics */}
          <CardShell
            className="lg:col-span-2"
            icon={ChartLine}
            title="Response Time Analytics"
            description="Track how fast your endpoints respond over time."
          >
            <div className="h-24 rounded-xl border border-border bg-background/50 p-3">
              <LineChart
                data={[
                  210, 190, 205, 176, 188, 165, 172, 150, 168, 158, 148, 160,
                ]}
                color="var(--chart-2)"
              />
            </div>
          </CardShell>

          {/* Feature 4 — Status pages */}
          <CardShell
            className="lg:col-span-2"
            icon={Globe}
            title="Public Status Pages"
            description="Share a simple, branded status page with your users."
          >
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <span className="size-2 rounded-full bg-success pulse-dot" />
                <span className="text-sm font-medium">
                  All Systems Operational
                </span>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
                {["Website", "API", "Database", "Authentication"].map((s) => (
                  <li key={s} className="flex items-center justify-between">
                    <span>{s}</span>
                    <span className="text-success">Operational</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardShell>

          {/* Feature 5 — Monitoring at a glance */}
          <CardShell
            className="lg:col-span-2"
            icon={Server}
            title="Monitoring at a Glance"
            description="See every monitor and its status in one place."
          >
            <ul className="space-y-1.5">
              {smallMonitors.map((m) => (
                <li
                  key={m.name}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2"
                >
                  <span className="font-mono text-xs">{m.name}</span>
                  <span
                    className={`
                      size-2 rounded-full
                      ${m.up ? "bg-success" : "bg-destructive"}
                    `}
                  />
                </li>
              ))}
            </ul>
          </CardShell>
        </div>
      </div>
    </section>
  );
}
