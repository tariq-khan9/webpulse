//apps/worker/src/supabase.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@webpulse/shared";
import { config } from "./config.js";

// Service-role client: bypasses RLS, which is what lets the worker write
// incidents, uptime, and alerts. A background process has no user session,
// so session persistence and token refresh are both turned off.
export const supabase = createClient<Database>(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
