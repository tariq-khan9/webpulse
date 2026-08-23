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
