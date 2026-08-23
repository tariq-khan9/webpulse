//apps/worker/src/state.ts
import { getMonitorStatus, pushResponseSample, setMonitorStatus } from "@webpulse/shared";
import type { CheckResult } from "./checker.js";
import { logger } from "./logger.js";
import { queueConnection } from "./redis.js";
import { supabase } from "./supabase.js";

export interface RecordedChange {
  outcome: string;
  incidentId: string | null;
}

// Compares the new verdict against the status cached in Redis. When nothing
// changed, Postgres is never touched — which is what keeps the database small
// enough for the free tier. Returns null when no change was recorded.
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
  // Omitted rather than passed as null: both columns are nullable and a
  // timeout produces neither.
  const { data, error } = await supabase.rpc("record_check_result", {
    p_monitor_id: monitorId,
    p_status: result.status,
    p_checked_at: checkedAt,
    p_status_code: result.statusCode ?? undefined,
    p_error_message: result.error ?? undefined,
  });

  if (error) {
    throw new Error(`Failed to record check result: ${error.message}`);
  }

  // The function returns jsonb, which the generated types widen to Json.
  const payload = data as unknown as { outcome: string; incident_id: string | null };
  const change: RecordedChange = {
    outcome: payload.outcome,
    incidentId: payload.incident_id,
  };

  logger.info("Status change recorded", {
    monitorId,
    status: result.status,
    outcome: change.outcome,
  });

  return change;
}
