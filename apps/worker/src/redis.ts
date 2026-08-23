//apps/worker/src/redis.ts
import { createRedisConnection } from "@webpulse/shared";
import { config } from "./config.js";

// Two connections on purpose. The BullMQ Worker holds a blocking connection
// while it waits for jobs, so it needs its own — sharing one would stall
// every queue operation behind that block.
export const queueConnection = createRedisConnection(config.redisUrl);
export const workerConnection = createRedisConnection(config.redisUrl);
