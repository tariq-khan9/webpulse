//apps/worker/src/index.ts
import { createRedisConnection } from "@webpulse/shared";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { supabase } from "./supabase.js";

const redis = createRedisConnection(config.redisUrl);

// Prove both dependencies actually work at boot, so the worker never sits
// there looking healthy while every job would fail.
async function verifyConnections(): Promise<void> {
  await redis.ping();
  logger.info("Redis connection ok");

  const { error } = await supabase.from("monitors").select("id").limit(1);
  if (error) {
    throw new Error(`Supabase connection failed: ${error.message}`);
  }
  logger.info("Supabase connection ok");
}

// PM2 sends SIGTERM on every restart and deploy.
function registerShutdown(): void {
  let shuttingDown = false;

  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.on(signal, () => {
      if (shuttingDown) return;
      shuttingDown = true;

      logger.info("Shutting down", { signal });
      redis
        .quit()
        .catch(() => redis.disconnect())
        .finally(() => process.exit(0));
    });
  }
}

async function main(): Promise<void> {
  logger.info("Worker starting");
  await verifyConnections();
  registerShutdown();
  logger.info("Worker ready");
}

main().catch((error: unknown) => {
  logger.error("Worker failed to start", { error: String(error) });
  process.exit(1);
});
