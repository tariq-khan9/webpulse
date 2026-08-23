import "server-only";

import { getMonitorStatus, type MonitorStatus } from "@webpulse/shared";
import { redis } from "./redis";

export interface MonitorRow {
  id: string;
  name: string;
  url: string;
  status: string;
  is_paused: boolean;
  check_interval_seconds: number;
  last_checked_at: string | null;
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
// fetched through RLS, so they are known to belong to the caller. Redis itself
// has no such protection.
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
      isPaused: row.is_paused,
      checkIntervalSeconds: row.check_interval_seconds,
      lastCheckedAt: cached?.lastCheckedAt ?? row.last_checked_at,
      lastResponseMs: cached?.lastResponseMs ?? null,
    };
  });
}
