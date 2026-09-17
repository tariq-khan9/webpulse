import "dotenv/config";
import { defineConfig } from "prisma/config";

// Used only by the Prisma CLI (migrate, generate, studio). The apps pass
// DATABASE_URL to the client themselves.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
