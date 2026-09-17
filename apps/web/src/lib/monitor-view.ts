import "server-only";

import {
  getMonitorStatus,
  getResponseSamples,
  type MonitorStatus,
} from "@webpulse/shared";
import { db } from "./db";
import { redis } from "./redis";

// The columns a monitor view is built from, shared by the list and the
// detail page so the two cannot drift apart.
export const monitorRowSelect = {
  id: true,
  name: true,
  url: true,
  status: true,
  isPaused: true,
  checkIntervalSeconds: true,
  lastCheckedAt: true,
} as const;

export interface MonitorRow {
  id: string;
  name: string;
  url: string;
  status: string;
  isPaused: boolean;
  checkIntervalSeconds: number;
  lastCheckedAt: Date | null;
}

export interface MonitorView {
  id: string;
  name: string;
  url: string;
  status: MonitorStatus | "unknown";
  isPaused: boolean;
  checkIntervalSeconds: number;
  lastCheckedAt: string | null;
  lastResponseMs: number | null;
}

// Redis holds the freshest picture: Postgres only records a status change, so
// its last_checked_at goes stale between incidents. Redis is preferred where
// it has an answer, with Postgres as the fallback.
//
// Reading Redis by monitor id is safe here only because the rows were already
// fetched filtered by the caller's user id. Redis itself has no such
// protection.
export async function withLiveStatus(
  rows: MonitorRow[],
): Promise<MonitorView[]> {
  const live = await Promise.all(
    rows.map((row) =>
      // A Redis outage degrades the dashboard to Postgres data rather than
      // failing the whole page.
      getMonitorStatus(redis, row.id).catch(() => null),
    ),
  );

  return rows.map((row, index) => {
    const cached = live[index];

    return {
      id: row.id,
      name: row.name,
      url: row.url,
      status: (cached?.status ?? row.status) as MonitorStatus | "unknown",
      isPaused: row.isPaused,
      checkIntervalSeconds: row.checkIntervalSeconds,
      lastCheckedAt: cached?.lastCheckedAt ?? row.lastCheckedAt?.toISOString() ?? null,
      lastResponseMs: cached?.lastResponseMs ?? null,
    };
  });
}

// The one definition of "this user's monitors, with live status". The
// dashboard page renders from it and the polling action re-reads it.
export async function getMonitorViews(userId: string): Promise<MonitorView[]> {
  const rows = await db.monitor.findMany({
    where: { userId },
    select: monitorRowSelect,
    orderBy: { createdAt: "asc" },
  });

  return withLiveStatus(rows);
}

// The samples key holds ~48h; the detail chart shows the last 24h of it.
export async function getRecentSamples(
  monitorId: string,
  windowMs = 24 * 60 * 60 * 1000,
): Promise<{ timestamp: number; responseMs: number }[]> {
  const cutoff = Date.now() - windowMs;

  const samples = await getResponseSamples(redis, monitorId).catch(() => []);
  return samples.filter((sample) => sample.timestamp >= cutoff);
}
