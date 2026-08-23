"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import {
  assertSafeUrl,
  clearMonitorState,
  removeMonitorScheduler,
  UnsafeUrlError,
  upsertMonitorScheduler,
} from "@webpulse/shared";
import { checkQueue, redis } from "@/lib/redis";
import { createClient } from "@/lib/supabase/server";
import { checkIntervalForSubscription } from "@/lib/tiers";

type ActionResult = { success: true } | { success: false; error: string };

const monitorSchema = z.object({
  name: z.string().trim().min(1, "Give the monitor a name.").max(100),
  url: z.string().trim().url("Enter a valid URL."),
});

// Server Actions are reachable by direct POST, not just through the UI, so
// every one of them re-checks the session rather than trusting the caller.
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

// Redis is kept in step so a change takes effect immediately instead of
// waiting for the worker's hourly reconcile. A failure here is logged rather
// than surfaced: the row is already correct, and the reconciler repairs the
// schedule. Reporting failure would wrongly suggest nothing was saved.
async function syncSchedule(
  monitorId: string,
  intervalSeconds: number | null,
): Promise<void> {
  try {
    if (intervalSeconds === null) {
      await removeMonitorScheduler(checkQueue, monitorId);
    } else {
      await upsertMonitorScheduler(checkQueue, monitorId, intervalSeconds);
    }
  } catch (error) {
    console.error("Failed to sync monitor schedule", { monitorId, error });
  }
}

async function clearCache(monitorId: string): Promise<void> {
  try {
    await clearMonitorState(redis, monitorId);
  } catch (error) {
    console.error("Failed to clear monitor cache", { monitorId, error });
  }
}

export async function createMonitorAction(input: {
  name: string;
  url: string;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const parsed = monitorSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // The worker refuses unsafe URLs at check time too, but validating here
  // means the user finds out now instead of owning a monitor that silently
  // never reports.
  try {
    await assertSafeUrl(parsed.data.url);
  } catch (error) {
    if (error instanceof UnsafeUrlError) {
      return { success: false, error: "That URL is not allowed." };
    }
    return { success: false, error: "That URL could not be resolved." };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  const intervalSeconds = checkIntervalForSubscription(
    subscription?.status ?? null,
  );

  // The monitor_limit trigger enforces the plan's cap in the database, so a
  // crafted request cannot get past it.
  const { data, error } = await supabase
    .from("monitors")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      url: parsed.data.url,
      check_interval_seconds: intervalSeconds,
    })
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("Monitor limit reached")) {
      return {
        success: false,
        error: "You have reached the monitor limit for your plan.",
      };
    }
    if (error.code === "23505") {
      return { success: false, error: "You are already monitoring that URL." };
    }
    return { success: false, error: error.message };
  }

  await syncSchedule(data.id, intervalSeconds);
  refresh();

  return { success: true };
}

export async function updateMonitorAction(input: {
  id: string;
  name: string;
  url: string;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const parsed = monitorSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await assertSafeUrl(parsed.data.url);
  } catch (error) {
    if (error instanceof UnsafeUrlError) {
      return { success: false, error: "That URL is not allowed." };
    }
    return { success: false, error: "That URL could not be resolved." };
  }

  // RLS restricts this to the caller's own rows, so a wrong id simply
  // matches nothing rather than touching someone else's monitor.
  const { data, error } = await supabase
    .from("monitors")
    .update({ name: parsed.data.name, url: parsed.data.url })
    .eq("id", input.id)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "You are already monitoring that URL." };
    }
    return { success: false, error: error.message };
  }

  if (!data) return { success: false, error: "Monitor not found." };

  // A changed URL makes the cached status meaningless — it describes the old
  // target. Clearing it lets the next check start from a clean slate.
  await clearCache(input.id);
  refresh();

  return { success: true };
}

export async function setMonitorPausedAction(input: {
  id: string;
  paused: boolean;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "You must be signed in." };

  // Goes through a SECURITY DEFINER function because pausing must also
  // resolve any open incident, and clients cannot write to incidents. The
  // function verifies ownership itself.
  const { error } = await supabase.rpc("set_monitor_paused", {
    p_monitor_id: input.id,
    p_paused: input.paused,
  });

  if (error) return { success: false, error: error.message };

  if (input.paused) {
    await syncSchedule(input.id, null);
    await clearCache(input.id);
  } else {
    const { data: monitor } = await supabase
      .from("monitors")
      .select("check_interval_seconds")
      .eq("id", input.id)
      .maybeSingle();

    if (monitor) await syncSchedule(input.id, monitor.check_interval_seconds);
  }

  refresh();
  return { success: true };
}

export async function deleteMonitorAction(input: {
  id: string;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const { data, error } = await supabase
    .from("monitors")
    .delete()
    .eq("id", input.id)
    .select("id")
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Monitor not found." };

  // Redis has no cascade of its own, and the status key has no TTL, so it
  // would outlive the monitor if not removed here.
  await syncSchedule(input.id, null);
  await clearCache(input.id);
  refresh();

  return { success: true };
}
