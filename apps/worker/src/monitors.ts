//apps/worker/src/monitors.ts
import { db } from "./db.js";

export interface ActiveMonitor {
  id: string;
  checkIntervalSeconds: number;
}

export interface MonitorConfig {
  id: string;
  userId: string;
  name: string;
  url: string;
  method: string;
  timeoutMs: number;
  isPaused: boolean;
}

// Returns null when the row is gone. Removing a scheduler does not remove the
// jobs it already queued, so a job can outlive the monitor it refers to.
export function getMonitorById(id: string): Promise<MonitorConfig | null> {
  return db.monitor.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      url: true,
      method: true,
      timeoutMs: true,
      isPaused: true,
    },
  });
}

// Throws rather than returning [] on failure, so callers can tell "there are
// no active monitors" apart from "the database did not answer". The
// reconciler's safety depends on that distinction.
export function getActiveMonitors(): Promise<ActiveMonitor[]> {
  return db.monitor.findMany({
    where: { isPaused: false },
    select: { id: true, checkIntervalSeconds: true },
  });
}
