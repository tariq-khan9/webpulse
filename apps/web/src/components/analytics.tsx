"use client";

import { useState } from "react";
import { Activity, Gauge, Clock, TriangleAlert } from "lucide-react";
import { LineChart, UptimeBars } from "@/components/charts";
import { SectionHeading } from "@/components/section-heading";

type RangeKey = "24h" | "7d" | "30d" | "90d";

const ranges: { key: RangeKey; label: string }[] = [
  { key: "24h", label: "24 hours" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
];

const data: Record<
  RangeKey,
  {
    uptime: string;
    response: string;
    downtime: string;
    incidents: string;
    series: number[];
    bars: number[];
  }
> = {
  "24h": {
    uptime: "100%",
    response: "178 ms",
    downtime: "0m",
    incidents: "0",
    series: [190, 176, 168, 182, 174, 160, 158, 172, 165, 150, 158, 148, 162],
    bars: Array.from({ length: 24 }, () => 1),
  },
  "7d": {
    uptime: "99.98%",
    response: "184 ms",
    downtime: "2m",
    incidents: "1",
    series: [182, 170, 176, 165, 190, 168, 172, 158, 166, 152, 160, 155],
    bars: [1, 1, 1, 0.98, 1, 1, 1],
  },
  "30d": {
    uptime: "99.94%",
    response: "191 ms",
    downtime: "26m",
    incidents: "3",
    series: [200, 188, 176, 182, 170, 195, 168, 178, 160, 172, 158, 164],
    bars: [
      1, 1, 1, 1, 0.96, 1, 1, 1, 1, 0.99, 1, 1, 1, 1, 1, 0.92, 1, 1, 1, 1, 1, 1,
      1, 0.98, 1, 1, 1, 1, 1, 1,
    ],
  },
  "90d": {
    uptime: "99.91%",
    response: "196 ms",
    downtime: "1h 12m",
    incidents: "7",
    series: [210, 195, 205, 188, 198, 176, 190, 182, 172, 186, 168, 178],
    bars: Array.from({ length: 30 }, (_, i) =>
      [4, 9, 15, 22, 27].includes(i) ? 0.9 : 1,
    ),
  },
};

export function Analytics() {
  const [range, setRange] = useState<RangeKey>("7d");
  const d = data[range];

  const stats = [
    { label: "Uptime", value: d.uptime, icon: Activity },
    { label: "Avg. response", value: d.response, icon: Gauge },
    { label: "Total downtime", value: d.downtime, icon: Clock },
    { label: "Incidents", value: d.incidents, icon: TriangleAlert },
  ];

  return (
    <section id="analytics" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Analytics"
          title="Understand your uptime."
          description="Rich uptime and performance analytics across any time range, so you always know how your sites are doing."
        />

        <div className="mt-14 overflow-hidden rounded-2xl border border-border glass shadow-xl shadow-black/30">
          {/* header + range tabs */}
          <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Performance overview</p>
              <p className="text-xs text-muted-foreground">
                api.webpulse.dev · all regions
              </p>
            </div>
            <div
              role="tablist"
              aria-label="Time range"
              className="inline-flex rounded-lg border border-border bg-background/50 p-1"
            >
              {ranges.map((r) => (
                <button
                  key={r.key}
                  role="tab"
                  aria-selected={range === r.key}
                  onClick={() => setRange(r.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    range === r.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-6">
            {/* stats */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-card/50 p-4"
                >
                  <s.icon className="size-4 text-muted-foreground" />
                  <p className="mt-3 font-mono text-2xl font-semibold tracking-tight">
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* response chart */}
            <div className="rounded-xl border border-border bg-card/50 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Response time</p>
                <span className="font-mono text-xs text-muted-foreground">
                  {ranges.find((r) => r.key === range)?.label}
                </span>
              </div>
              <div className="mt-4 h-48">
                <LineChart data={d.series} />
              </div>
            </div>

            {/* uptime history */}
            <div className="rounded-xl border border-border bg-card/50 p-5">
              <p className="text-sm font-medium">Uptime history</p>
              <div className="mt-4 h-8">
                <UptimeBars data={d.bars} />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span>Start of period</span>
                <span>Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
