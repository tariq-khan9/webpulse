//apps/worker/src/state.ts
import { getMonitorStatus, pushResponseSample, setMonitorStatus } from "@webpulse/shared";
import type { CheckResult } from "./checker.js";
import { logger } from "./logger.js";
import { queueConnection } from "./redis.js";
import { db } from "./db.js";

export interface RecordedChange {
  outcome: string;
  incidentId: string | null;
}

// Compares the new verdict against the status cached in Redis. When nothing
// changed, Postgres is never touched — which is what keeps the database small
// enough for a small VPS. Returns null when no change was recorded.
export async function recordCheckResult(
  monitorId: string,
  result: CheckResult,
): Promise<RecordedChange | null> {
  const checkedAtMs = Date.now();
  const checkedAt = new Date(checkedAtMs).toISOString();

  const cached = await getMonitorStatus(queueConnection, monitorId);

  await setMonitorStatus(queueConnection, monitorId, {
    status: result.status,
    lastCheckedAt: checkedAt,
    lastResponseMs: result.responseMs,
  });

  if (result.status === "up" && result.responseMs !== null) {
    // Redis runs with noeviction, so a full instance makes writes fail. A
    // chart sample is cosmetic and must never fail the check itself.
    try {
      await pushResponseSample(queueConnection, monitorId, {
        timestamp: checkedAtMs,
        responseMs: result.responseMs,
      });
    } catch (error) {
      logger.warn("Could not store response sample", {
        monitorId,
        error: String(error),
      });
    }
  }

  if (cached?.status === result.status) return null;

  // Only reached when the status looks new. The function re-reads the real
  // previous status itself, so an empty or stale cache cannot corrupt it.
  // Casts pin each parameter type, since a null carries none of its own.
  const [row] = await db.$queryRaw<[{ result: { outcome: string; incident_id: string | null } }]>`
    SELECT record_check_result(
      ${monitorId}::uuid,
      ${result.status}::text,
      ${new Date(checkedAtMs)}::timestamptz,
      ${result.statusCode}::integer,
      ${result.error}::text
    ) AS result
  `;

  const change: RecordedChange = {
    outcome: row.result.outcome,
    incidentId: row.result.incident_id,
  };

  logger.info("Status change recorded", {
    monitorId,
    status: result.status,
    outcome: change.outcome,
  });

  return change;
}
