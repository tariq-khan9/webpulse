//apps/worker/src/consumer.ts
import { Worker } from "bullmq";
import { CHECK_QUEUE_NAME, type CheckJobPayload } from "@webpulse/shared";
import { sendAlert } from "./alerts.js";
import { runCheck } from "./checker.js";
import { logger } from "./logger.js";
import { getMonitorById } from "./monitors.js";
import { workerConnection } from "./redis.js";
import { recordCheckResult } from "./state.js";
import { UnsafeUrlError } from "./url-guard.js";

// Checks are IO-bound — almost all of the time is spent waiting on the
// network — so a modest concurrency keeps throughput up without competing
// with web and Redis for the VPS.
const CONCURRENCY = 10;

export const checkConsumer = new Worker<CheckJobPayload>(
  CHECK_QUEUE_NAME,
  async (job) => {
    const { monitorId } = job.data;
    const monitor = await getMonitorById(monitorId);

    // A job can outlive its monitor, since removing a scheduler leaves any
    // already-queued job in place. Not an error.
    if (!monitor) {
      logger.info("Skipping check, monitor no longer exists", { monitorId });
      return;
    }

    if (monitor.isPaused) {
      logger.info("Skipping check, monitor is paused", { monitorId });
      return;
    }

    try {
      const result = await runCheck({
        url: monitor.url,
        method: monitor.method,
        timeoutMs: monitor.timeoutMs,
      });

      const change = await recordCheckResult(monitorId, result);
      logger.info("Check complete", { monitorId, ...result });

      if (change?.incidentId) {
        const type =
          change.outcome === "incident_opened"
            ? "down"
            : change.outcome === "incident_resolved"
              ? "up"
              : null;

        if (type) {
          // The incident is already committed, so a failed email must never
          // fail the check.
          try {
            await sendAlert(monitor, change.incidentId, type, result);
          } catch (alertError) {
            logger.error("Failed to send alert", {
              monitorId,
              error: String(alertError),
            });
          }
        }
      }
    } catch (error) {
      if (error instanceof UnsafeUrlError) {
        // Deliberately not recorded as downtime: that would charge the
        // monitor with an outage its site never had.
        logger.error("Refusing to check unsafe URL", {
          monitorId,
          error: error.message,
        });
        return;
      }
      throw error;
    }
  },
  { connection: workerConnection, concurrency: CONCURRENCY },
);

// Without these, a failing job is completely silent.
checkConsumer.on("failed", (job, error) => {
  logger.error("Check job failed", {
    monitorId: job?.data.monitorId,
    error: error.message,
  });
});

checkConsumer.on("error", (error) => {
  logger.error("Consumer error", { error: error.message });
});
