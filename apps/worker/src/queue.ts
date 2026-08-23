//apps/worker/src/queue.ts
import { createCheckQueue } from "@webpulse/shared";
import { queueConnection } from "./redis.js";

export const checkQueue = createCheckQueue(queueConnection);
