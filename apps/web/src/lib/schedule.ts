import "server-only";

import {
  clearMonitorState,
  removeMonitorScheduler,
  upsertMonitorScheduler,
} from "@webpulse/shared";
import { checkQueue, redis } from "./redis";

// Redis is kept in step so a change takes effect immediately instead of
// waiting for the worker's hourly reconcile. A failure here is logged rather
// than surfaced: the row is already correct, and the reconciler repairs the
// schedule. Reporting failure would wrongly suggest nothing was saved.
export async function syncSchedule(
  monitorId: string,
  intervalSeconds: number | null,
): Promise<void> {
  try {
    if (intervalSeconds === null) {
      await removeMonitorScheduler(checkQueue, monitorId);
    } else {
      await upsertMonitorScheduler(checkQueue, monitorId, intervalSeconds);
    }
  } catch (error) {
    console.error("Failed to sync monitor schedule", { monitorId, error });
  }
}

export async function clearCache(monitorId: string): Promise<void> {
  try {
    await clearMonitorState(redis, monitorId);
  } catch (error) {
    console.error("Failed to clear monitor cache", { monitorId, error });
  }
}
