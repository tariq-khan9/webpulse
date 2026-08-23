//apps/worker/src/reconciler.ts
import { monitorJobSchedulerId, upsertMonitorScheduler } from "@webpulse/shared";
import { logger } from "./logger.js";
import { getActiveMonitors } from "./monitors.js";
import { checkQueue } from "./queue.js";

interface ExpectedScheduler {
  monitorId: string;
  intervalSeconds: number;
}

// Bring Redis in line with Postgres. Postgres decides what should be
// monitored; Redis only decides when. Running this at boot and hourly is what
// lets a flushed Redis, a crashed worker, or a row edited by hand heal itself.
export async function reconcileSchedulers(): Promise<void> {
  // Reads first, and throws if the database did not answer. Treating a failed
  // read as "no active monitors" would delete every scheduler below and stop
  // all monitoring silently, so the whole reconcile aborts instead.
  const monitors = await getActiveMonitors();

  const expected = new Map<string, ExpectedScheduler>();
  for (const monitor of monitors) {
    expected.set(monitorJobSchedulerId(monitor.id), {
      monitorId: monitor.id,
      intervalSeconds: monitor.checkIntervalSeconds,
    });
  }

  const existing = await checkQueue.getJobSchedulers(0, -1);

  let removed = 0;
  for (const scheduler of existing) {
    if (expected.has(scheduler.key)) continue;

    // Monitor was deleted or paused while this scheduler stayed behind.
    await checkQueue.removeJobScheduler(scheduler.key);
    removed++;

  }

  const currentIntervals = new Map(existing.map((s) => [s.key, s.every]));

  let upserted = 0;
  for (const [schedulerId, { monitorId, intervalSeconds }] of expected) {
    // Only write on a real difference. Re-upserting an unchanged scheduler
    // would reset its next fire time on every hourly run.
    if (currentIntervals.get(schedulerId) === intervalSeconds * 1000) continue;

    await upsertMonitorScheduler(checkQueue, monitorId, intervalSeconds);
    upserted++;
  }

  logger.info("Reconciled schedulers", { active: expected.size, upserted, removed });
}
