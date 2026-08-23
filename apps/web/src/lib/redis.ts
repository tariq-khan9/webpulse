import "server-only";

import { createCheckQueue, createRedisConnection } from "@webpulse/shared";

// The shared package pulls in ioredis and bullmq, which cannot run in a
// browser. The import above turns an accidental client-side import into a
// clear build error instead of a confusing bundler failure.

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("Missing required environment variable: REDIS_URL");
}

type RedisConnection = ReturnType<typeof createRedisConnection>;
type CheckQueue = ReturnType<typeof createCheckQueue>;

// Dev hot-reloading re-evaluates modules on every change, which would open a
// new Redis connection each time. Caching on globalThis keeps a single one.
const globalForRedis = globalThis as typeof globalThis & {
  webpulseRedis?: RedisConnection;
  webpulseCheckQueue?: CheckQueue;
};

export const redis: RedisConnection =
  globalForRedis.webpulseRedis ?? createRedisConnection(redisUrl);

export const checkQueue: CheckQueue =
  globalForRedis.webpulseCheckQueue ?? createCheckQueue(redis);

if (process.env.NODE_ENV !== "production") {
  globalForRedis.webpulseRedis = redis;
  globalForRedis.webpulseCheckQueue = checkQueue;
}
