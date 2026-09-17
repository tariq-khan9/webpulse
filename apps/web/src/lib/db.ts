import "server-only";

import { createPrismaClient } from "@webpulse/shared";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

type PrismaClient = ReturnType<typeof createPrismaClient>;

// Dev hot-reloading re-evaluates modules on every change, which would open a
// new connection pool each time. Caching on globalThis keeps a single one.
const globalForDb = globalThis as typeof globalThis & {
  webpulseDb?: PrismaClient;
};

// Connects straight to Postgres with no RLS behind it: every query on user
// data must filter by the signed-in user's id itself.
export const db: PrismaClient = globalForDb.webpulseDb ?? createPrismaClient(databaseUrl);

if (process.env.NODE_ENV !== "production") {
  globalForDb.webpulseDb = db;
}
