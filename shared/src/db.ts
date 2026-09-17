//shared/src/db.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "./generated/prisma/client.js";

export { Prisma, PrismaClient };

// Each client owns a connection pool, so each app process creates exactly
// one and reuses it.
export function createPrismaClient(connectionString: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

// A unique constraint rejected the write, e.g. a duplicate monitor URL or an
// alert that was already recorded.
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

// True when a database function or trigger raised an exception whose message
// contains `text` (e.g. "Monitor limit reached").
export function isDatabaseError(error: unknown, text: string): boolean {
  return error instanceof Error && error.message.includes(text);
}
