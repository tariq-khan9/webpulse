import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

import { ResponseChart } from "@/components/dashboard/response-chart";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { db } from "@/lib/db";
import {
  getRecentSamples,
  monitorRowSelect,
  withLiveStatus,
} from "@/lib/monitor-view";
import { requireSession } from "@/lib/session";
import { averageUptime } from "@/lib/uptime";

function formatDuration(startedAt: Date, resolvedAt: Date | null): string {
  const end = resolvedAt ? resolvedAt.getTime() : Date.now();
  const seconds = Math.max(0, Math.round((end - startedAt.getTime()) / 1000));

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function formatPercent(value: number | null): string {
  return value === null ? "—" : `${value}%`;
}

const cardClass =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/40";

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <div className="mt-1.5 text-lg font-medium text-white">{children}</div>
    </div>
  );
}

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { user } = await requireSession();

  // Postgres rejects a malformed uuid with an error rather than no rows.
  if (!z.uuid().safeParse(id).success) notFound();

  // Filtering on userId means a monitor belonging to someone else simply is
  // not found. Everything below is keyed by this verified id.
  const row = await db.monitor.findFirst({
    where: { id, userId: user.id },
    select: monitorRowSelect,
  });

  if (!row) notFound();

  const [[monitor], incidents, uptimeRows, samples] = await Promise.all([
    withLiveStatus([row]),
    db.incident.findMany({
      where: { monitorId: id },
      select: {
        id: true,
        startedAt: true,
        resolvedAt: true,
        statusCode: true,
        errorMessage: true,
      },
      orderBy: { startedAt: "desc" },
      take: 20,
    }),
    db.uptimeDaily.findMany({
      where: { monitorId: id },
      select: { date: true, uptimePercentage: true, avgResponseMs: true },
      orderBy: { date: "desc" },
      take: 30,
    }),
    getRecentSamples(id),
  ]);

  // A DATE column arrives as midnight UTC, and the percentage as a Decimal.
  const uptime = uptimeRows.map((day) => ({
    date: day.date.toISOString().slice(0, 10),
    uptimePercentage: day.uptimePercentage.toNumber(),
    avgResponseMs: day.avgResponseMs,
  }));

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        All monitors
      </Link>

      <header>
        <h1 className="text-2xl font-semibold">{monitor.name}</h1>
        <p className="mt-1 break-all text-sm text-slate-400">{monitor.url}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Status">
          <StatusBadge status={monitor.status} isPaused={monitor.isPaused} />
        </Stat>
        <Stat label="Last response">
          {monitor.lastResponseMs !== null && !monitor.isPaused
            ? `${monitor.lastResponseMs} ms`
            : "—"}
        </Stat>
        <Stat label="Uptime · 7 days">{formatPercent(averageUptime(uptime, 7))}</Stat>
        <Stat label="Uptime · 30 days">{formatPercent(averageUptime(uptime, 30))}</Stat>
      </section>

      <section className={cardClass}>
        <h2 className="mb-1 font-medium text-white">Response time</h2>
        <p className="mb-4 text-xs text-slate-500">
          Last 24 hours, successful checks only — downtime reads as a gap.
        </p>
        <ResponseChart samples={samples} />
      </section>

      <section className={cardClass}>
        <h2 className="mb-4 font-medium text-white">Incidents</h2>

        {incidents.length > 0 ? (
          <ul className="divide-y divide-white/5">
            {incidents.map((incident) => (
              <li
                key={incident.id}
                className="flex flex-wrap items-baseline justify-between gap-2 py-3"
              >
                <div>
                  <p className="text-sm text-slate-200">
                    {incident.startedAt.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {incident.errorMessage ?? "No response"}
                    {incident.statusCode ? ` · HTTP ${incident.statusCode}` : ""}
                  </p>
                </div>

                <span
                  className={`text-sm ${incident.resolvedAt ? "text-slate-400" : "text-red-400"}`}
                >
                  {incident.resolvedAt ? "" : "ongoing · "}
                  {formatDuration(incident.startedAt, incident.resolvedAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-slate-500">
            No incidents recorded. This monitor has not gone down.
          </p>
        )}
      </section>

      <section className={cardClass}>
        <h2 className="mb-4 font-medium text-white">Daily uptime</h2>

        {uptime.length > 0 ? (
          <ul className="divide-y divide-white/5">
            {uptime.map((day) => (
              <li
                key={day.date}
                className="flex items-baseline justify-between gap-2 py-2.5 text-sm"
              >
                <span className="text-slate-400">{day.date}</span>
                <span className="text-slate-200">
                  {day.uptimePercentage}%
                  {day.avgResponseMs !== null ? (
                    <span className="ml-3 text-slate-500">
                      {day.avgResponseMs} ms avg
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-slate-500">
            Daily figures appear after the first nightly rollup.
          </p>
        )}
      </section>
    </div>
  );
};

export default Page;
