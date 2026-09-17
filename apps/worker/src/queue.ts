//apps/worker/src/queue.ts
import { createCheckQueue, createRollupQueue } from "@webpulse/shared";
import { queueConnection } from "./redis.js";

export const checkQueue = createCheckQueue(queueConnection);

export const rollupQueue = createRollupQueue(queueConnection);
