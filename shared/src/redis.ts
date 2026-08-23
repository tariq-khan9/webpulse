//shared/src/redis.ts
import IORedis from "ioredis";

// BullMQ requires maxRetriesPerRequest: null on any connection it uses for
// blocking commands. Both the queue module and the metrics module share this
// one connection factory so web and worker never configure Redis differently.
export function createRedisConnection(redisUrl: string): IORedis {
  return new IORedis(redisUrl, { maxRetriesPerRequest: null });
}
