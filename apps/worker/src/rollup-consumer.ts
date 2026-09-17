//apps/worker/src/rollup-consumer.ts
import { Worker } from "bullmq";
import { ROLLUP_QUEUE_NAME } from "@webpulse/shared";
import { logger } from "./logger.js";
import { workerConnection } from "./redis.js";
import { runDailyRollup } from "./rollup.js";

// Concurrency 1: the rollup is a single nightly pass, and running two at once
// would only race each other over the same rows.
export const rollupConsumer = new Worker(
  ROLLUP_QUEUE_NAME,
  async () => {
    await runDailyRollup();
  },
  { connection: workerConnection, concurrency: 1 },
);

rollupConsumer.on("failed", (_job, error) => {
  logger.error("Daily rollup job failed", { error: error.message });
});

rollupConsumer.on("error", (error) => {
  logger.error("Rollup consumer error", { error: error.message });
});
