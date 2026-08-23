//apps/worker/src/monitors.ts
import { supabase } from "./supabase.js";

export interface ActiveMonitor {
  id: string;
  checkIntervalSeconds: number;
}

export interface MonitorConfig {
  id: string;
  userId: string;
  name: string;
  url: string;
  method: string;
  timeoutMs: number;
  isPaused: boolean;
}

// Returns null when the row is gone. Removing a scheduler does not remove the
// jobs it already queued, so a job can outlive the monitor it refers to.
export async function getMonitorById(id: string): Promise<MonitorConfig | null> {
  const { data, error } = await supabase
    .from("monitors")
    .select("id, user_id, name, url, method, timeout_ms, is_paused")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load monitor ${id}: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    url: data.url,
    method: data.method,
    timeoutMs: data.timeout_ms,
    isPaused: data.is_paused,
  };
}

// Throws rather than returning [] on failure, so callers can tell "there are
// no active monitors" apart from "the database did not answer". The
// reconciler's safety depends on that distinction.
export async function getActiveMonitors(): Promise<ActiveMonitor[]> {
  const { data, error } = await supabase
    .from("monitors")
    .select("id, check_interval_seconds")
    .eq("is_paused", false);

  if (error) {
    throw new Error(`Failed to load active monitors: ${error.message}`);
  }

  return data.map((row) => ({
    id: row.id,
    checkIntervalSeconds: row.check_interval_seconds,
  }));
}
