//apps/worker/src/config.ts
import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Read at import time so a misconfigured worker dies at boot with a clear
// message, rather than on the first job that happens to need the value.
export const config = Object.freeze({
  redisUrl: requireEnv("REDIS_URL"),
  databaseUrl: requireEnv("DATABASE_URL"),
  resendKey: requireEnv("RESEND_KEY"),
  alertFromEmail: requireEnv("ALERT_FROM_EMAIL"),
});
