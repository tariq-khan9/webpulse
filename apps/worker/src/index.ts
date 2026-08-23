//apps/worker/src/index.ts
import { checkConsumer } from "./consumer.js";
import { logger } from "./logger.js";
import { checkQueue } from "./queue.js";
import { reconcileSchedulers } from "./reconciler.js";
import { queueConnection, workerConnection } from "./redis.js";
import { supabase } from "./supabase.js";

const RECONCILE_INTERVAL_MS = 60 * 60 * 1000;

// Prove both dependencies actually work at boot, so the worker never sits
// there looking healthy while every job would fail.
async function verifyConnections(): Promise<void> {
  await queueConnection.ping();
  logger.info("Redis connection ok");

  const { error } = await supabase.from("monitors").select("id").limit(1);
  if (error) {
    throw new Error(`Supabase connection failed: ${error.message}`);
  }
  logger.info("Supabase connection ok");
}

// A failed reconcile is never fatal: the schedulers already in Redis keep
// firing, and the next run picks up whatever drifted.
async function safeReconcile(): Promise<void> {
  try {
    await reconcileSchedulers();
  } catch (error) {
    logger.error("Scheduler reconcile failed", { error: String(error) });
  }
}

async function shutdown(reconcileTimer: NodeJS.Timeout): Promise<void> {
  clearInterval(reconcileTimer);

  try {
    // Close the consumer first so in-flight checks can finish before the
    // connections they depend on go away.
    await checkConsumer.close();
    await checkQueue.close();
    await queueConnection.quit();
    await workerConnection.quit();
  } catch (error) {
    logger.error("Error during shutdown", { error: String(error) });
  }

  process.exit(0);
}

// PM2 sends SIGTERM on every restart and deploy.
function registerShutdown(reconcileTimer: NodeJS.Timeout): void {
  let shuttingDown = false;

  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.on(signal, () => {
      if (shuttingDown) return;
      shuttingDown = true;

      logger.info("Shutting down", { signal });
      void shutdown(reconcileTimer);
    });
  }
}

async function main(): Promise<void> {
  logger.info("Worker starting");
  await verifyConnections();
  await safeReconcile();

  const reconcileTimer = setInterval(() => void safeReconcile(), RECONCILE_INTERVAL_MS);

  registerShutdown(reconcileTimer);
  logger.info("Worker ready");
}

main().catch((error: unknown) => {
  logger.error("Worker failed to start", { error: String(error) });
  process.exit(1);
});
