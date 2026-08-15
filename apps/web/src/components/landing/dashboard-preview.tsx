import {
  Activity,
  MonitorCheck,
  TriangleAlert,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { LineChart, UptimeBars } from "@/components/landing/charts";

const stats = [
  {
    label: "Overall uptime",
    value: "99.98%",
    icon: Activity,
    trend: "+0.02%",
    up: true,
  },
  {
    label: "Monitors",
    value: "12",
    icon: MonitorCheck,
    trend: "2 new",
    up: true,
  },
  {
    label: "Active incidents",
    value: "1",
    icon: TriangleAlert,
    trend: "mystore.com",
    up: false,
  },
  {
    label: "Avg. response time",
    value: "184 ms",
    icon: Gauge,
    trend: "-12 ms",
    up: true,
  },
];

const monitors = [
  {
    name: "api.webpulse.dev",
    uptime: "100%",
    response: "96 ms",
    status: "Operational",
    state: "up" as const,
  },
  {
    name: "example.com",
    uptime: "99.99%",
    response: "142 ms",
    status: "Operational",
    state: "up" as const,
  },
  {
    name: "mystore.com",
    uptime: "98.71%",
    response: "— ms",
    status: "Down",
    state: "down" as const,
  },
  {
    name: "app.example.com",
    uptime: "99.96%",
    response: "211 ms",
    status: "Operational",
    state: "up" as const,
  },
];

const responseSeries = [
  190, 176, 168, 182, 174, 160, 158, 172, 165, 150, 158, 148, 162, 155, 168,
  178, 172, 160, 158, 166, 152, 148, 156, 184,
];

const uptimeBars = [
  1, 1, 1, 1, 1, 0.999, 1, 1, 1, 1, 1, 0.95, 1, 1, 1, 1, 1, 1, 0.999, 1, 1, 1,
  1, 0.88, 1, 1, 1, 1, 1, 1,
];

export function DashboardPreview() {
  return (
    <section className="relative px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative">
          {/* glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[2rem] bg-gradient-to-b from-primary/20 to-transparent blur-2xl"
          />

          <div className="overflow-hidden rounded-2xl border border-border glass shadow-2xl shadow-black/40">
            {/* App chrome */}
            <div className="flex items-center gap-2 border-b border-border bg-card/60 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="size-3 rounded-full bg-destructive/70" />
                <span className="size-3 rounded-full bg-warning/70" />
                <span className="size-3 rounded-full bg-success/70" />
              </div>
              <div className="mx-auto flex items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-success" />
                app.webpulse.dev/dashboard
              </div>
            </div>

            <div className="grid gap-4 p-4 sm:p-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-border bg-card/50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <s.icon className="size-4 text-muted-foreground" />
                      <span
                        className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
                          s.up ? "text-success" : "text-warning"
                        }`}
                      >
                        {s.up ? (
                          <ArrowUpRight className="size-3" />
                        ) : (
                          <ArrowDownRight className="size-3" />
                        )}
                        {s.trend}
                      </span>
                    </div>
                    <p className="mt-3 font-mono text-2xl font-semibold tracking-tight">
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-5">
                {/* Chart */}
                <div className="rounded-xl border border-border bg-card/50 p-4 lg:col-span-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Response time</p>
                      <p className="text-xs text-muted-foreground">
                        Last 24 hours · all monitors
                      </p>
                    </div>
                    <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-xs text-primary">
                      184 ms avg
                    </span>
                  </div>
                  <div className="mt-4 h-40">
                    <LineChart data={responseSeries} showDots={false} />
                  </div>
                  <div className="mt-3">
                    <div className="h-7">
                      <UptimeBars data={uptimeBars} />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                      <span>30 days ago</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>

                {/* Monitor list */}
                <div className="rounded-xl border border-border bg-card/50 p-4 lg:col-span-2">
                  <p className="text-sm font-medium">Monitors</p>
                  <ul className="mt-3 flex flex-col gap-1">
                    {monitors.map((m) => (
                      <li
                        key={m.name}
                        className="flex items-center justify-between rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={`
                              size-2 shrink-0 rounded-full
                              ${
                                m.state === "up"
                                  ? "bg-success pulse-dot"
                                  : "bg-destructive"
                              }
                            `}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-mono text-xs">
                              {m.name}
                            </p>
                            <p
                              className={`text-[11px] ${
                                m.state === "up"
                                  ? "text-muted-foreground"
                                  : "text-destructive"
                              }`}
                            >
                              {m.status}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-xs">{m.uptime}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {m.response}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
