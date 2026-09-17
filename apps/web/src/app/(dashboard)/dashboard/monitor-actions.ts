"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import {
  assertSafeUrl,
  isDatabaseError,
  isUniqueViolation,
  UnsafeUrlError,
} from "@webpulse/shared";
import { db } from "@/lib/db";
import { getMonitorViews, type MonitorView } from "@/lib/monitor-view";
import { clearCache, syncSchedule } from "@/lib/schedule";
import { getSession } from "@/lib/session";
import { checkIntervalForSubscription } from "@/lib/tiers";

type ActionResult = { success: true } | { success: false; error: string };

const monitorSchema = z.object({
  name: z.string().trim().min(1, "Give the monitor a name.").max(100),
  url: z.string().trim().url("Enter a valid URL."),
});

// Postgres rejects a malformed uuid with an error, so ids are checked first
// and a bad one is reported like any other unknown monitor.
const monitorIdSchema = z.uuid();

const NOT_SIGNED_IN = { success: false, error: "You must be signed in." } as const;
const NOT_FOUND = { success: false, error: "Monitor not found." } as const;

// Server Actions are reachable by direct POST, not just through the UI, so
// every one of them re-checks the session rather than trusting the caller.
async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user.id ?? null;
}

async function checkUrl(url: string): Promise<ActionResult> {
  // The worker refuses unsafe URLs at check time too, but validating here
  // means the user finds out now instead of owning a monitor that silently
  // never reports.
  try {
    await assertSafeUrl(url);
    return { success: true };
  } catch (error) {
    if (error instanceof UnsafeUrlError) {
      return { success: false, error: "That URL is not allowed." };
    }
    return { success: false, error: "That URL could not be resolved." };
  }
}

// Polled by the dashboard so status, last-checked time and response time stay
// current without a reload — a server-rendered page reads Redis once, but the
// worker keeps writing to it. Returns null rather than an empty list when the
// session has gone, so an expired cookie cannot blank out the panel.
export async function listMonitorsAction(): Promise<MonitorView[] | null> {
  const userId = await getUserId();
  if (!userId) return null;

  return getMonitorViews(userId);
}

export async function createMonitorAction(input: {
  name: string;
  url: string;
}): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return NOT_SIGNED_IN;

  const parsed = monitorSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const urlCheck = await checkUrl(parsed.data.url);
  if (!urlCheck.success) return urlCheck;

  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { status: true },
  });

  const intervalSeconds = checkIntervalForSubscription(subscription?.status ?? null);

  // The monitor_limit trigger enforces the plan's cap in the database, so a
  // crafted request cannot get past it.
  let monitorId: string;
  try {
    const monitor = await db.monitor.create({
      data: {
        userId,
        name: parsed.data.name,
        url: parsed.data.url,
        checkIntervalSeconds: intervalSeconds,
      },
      select: { id: true },
    });
    monitorId = monitor.id;
  } catch (error) {
    if (isDatabaseError(error, "Monitor limit reached")) {
      return { success: false, error: "You have reached the monitor limit for your plan." };
    }
    if (isUniqueViolation(error)) {
      return { success: false, error: "You are already monitoring that URL." };
    }
    throw error;
  }

  await syncSchedule(monitorId, intervalSeconds);
  refresh();

  return { success: true };
}

export async function updateMonitorAction(input: {
  id: string;
  name: string;
  url: string;
}): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return NOT_SIGNED_IN;

  if (!monitorIdSchema.safeParse(input.id).success) return NOT_FOUND;

  const parsed = monitorSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const urlCheck = await checkUrl(parsed.data.url);
  if (!urlCheck.success) return urlCheck;

  // Filtering on userId means a wrong id matches nothing rather than touching
  // someone else's monitor.
  let updated: number;
  try {
    const result = await db.monitor.updateMany({
      where: { id: input.id, userId },
      data: { name: parsed.data.name, url: parsed.data.url },
    });
    updated = result.count;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { success: false, error: "You are already monitoring that URL." };
    }
    throw error;
  }

  if (updated === 0) return NOT_FOUND;

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
  const userId = await getUserId();
  if (!userId) return NOT_SIGNED_IN;

  if (!monitorIdSchema.safeParse(input.id).success) return NOT_FOUND;

  // A database function, because pausing must also resolve any open incident
  // in the same transaction. It verifies ownership itself.
  try {
    await db.$executeRaw`
      SELECT set_monitor_paused(${input.id}::uuid, ${userId}, ${input.paused})
    `;
  } catch (error) {
    if (isDatabaseError(error, "Monitor limit reached")) {
      return {
        success: false,
        error: "Your plan's monitor limit is reached. Pause or delete another monitor first.",
      };
    }
    if (isDatabaseError(error, "Monitor not found")) return NOT_FOUND;
    throw error;
  }

  if (input.paused) {
    await syncSchedule(input.id, null);
    await clearCache(input.id);
  } else {
    const monitor = await db.monitor.findFirst({
      where: { id: input.id, userId },
      select: { checkIntervalSeconds: true },
    });

    if (monitor) await syncSchedule(input.id, monitor.checkIntervalSeconds);
  }

  refresh();
  return { success: true };
}

export async function deleteMonitorAction(input: {
  id: string;
}): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return NOT_SIGNED_IN;

  if (!monitorIdSchema.safeParse(input.id).success) return NOT_FOUND;

  const { count } = await db.monitor.deleteMany({
    where: { id: input.id, userId },
  });

  if (count === 0) return NOT_FOUND;

  // Redis has no cascade of its own, and the status key has no TTL, so it
  // would outlive the monitor if not removed here.
  await syncSchedule(input.id, null);
  await clearCache(input.id);
  refresh();

  return { success: true };
}
