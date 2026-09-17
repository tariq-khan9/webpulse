//apps/worker/src/db.ts
import { createPrismaClient } from "@webpulse/shared";
import { config } from "./config.js";

// The worker's only database client. It connects directly to Postgres, so
// every query here must scope its own rows — there is no RLS behind it.
export const db = createPrismaClient(config.databaseUrl);
