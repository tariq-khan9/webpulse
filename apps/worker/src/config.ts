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
  supabaseUrl: requireEnv("SUPABASE_URL"),
  supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  resendKey: requireEnv("RESEND_KEY"),
  alertFromEmail: requireEnv("ALERT_FROM_EMAIL"),
});
