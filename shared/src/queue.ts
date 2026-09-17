//shared/src/queue.ts
import { Queue } from "bullmq";
import type IORedis from "ioredis";
import type { CheckJobPayload } from "./types.js";

export const CHECK_QUEUE_NAME = "monitor-checks";

// The single naming convention for a monitor's repeating job scheduler, so the
// worker's reconciler and web's monitor CRUD actions always agree on which
// scheduler belongs to which monitor.
export function monitorJobSchedulerId(monitorId: string): string {
  return `monitor:${monitorId}`;
}

export function createCheckQueue(connection: IORedis): Queue<CheckJobPayload> {
  return new Queue<CheckJobPayload>(CHECK_QUEUE_NAME, { connection });
}

// Both the worker's reconciler and web's monitor actions go through these, so
// a scheduler created from either side is identical. Completed jobs are
// removed because the real output lives in Postgres and the Redis status key;
// recent failures are kept for debugging.
export async function upsertMonitorScheduler(
  queue: Queue<CheckJobPayload>,
  monitorId: string,
  intervalSeconds: number,
): Promise<void> {
  await queue.upsertJobScheduler(
    monitorJobSchedulerId(monitorId),
    { every: intervalSeconds * 1000 },
    {
      name: "check",
      data: { monitorId },
      opts: {
        removeOnComplete: true,
        removeOnFail: { count: 100 },
      },
    },
  );
}

export async function removeMonitorScheduler(
  queue: Queue<CheckJobPayload>,
  monitorId: string,
): Promise<void> {
  await queue.removeJobScheduler(monitorJobSchedulerId(monitorId));
}

// ---------------------------------------------------------------------------
// Daily rollup
// ---------------------------------------------------------------------------
// Its own queue rather than a second job name on the check queue, so the two
// keep separate payload types and separate concurrency.

export const ROLLUP_QUEUE_NAME = "daily-rollup";

const ROLLUP_SCHEDULER_ID = "daily-rollup";

export function createRollupQueue(connection: IORedis): Queue {
  return new Queue(ROLLUP_QUEUE_NAME, { connection });
}

// Runs at 00:10 UTC. The delay past midnight leaves room for any check still
// in flight to close out the previous day before it is summarised.
export async function upsertRollupScheduler(queue: Queue): Promise<void> {
  await queue.upsertJobScheduler(
    ROLLUP_SCHEDULER_ID,
    { pattern: "10 0 * * *", tz: "UTC" },
    {
      name: "rollup",
      opts: { removeOnComplete: true, removeOnFail: { count: 30 } },
    },
  );
}
