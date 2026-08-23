//apps/worker/src/checker.ts
import type { MonitorStatus } from "@webpulse/shared";
import { assertSafeUrl, UnsafeUrlError } from "./url-guard.js";

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = [1000, 2000];

export interface CheckTarget {
  url: string;
  method: string;
  timeoutMs: number;
}

export interface CheckResult {
  status: MonitorStatus;
  statusCode: number | null;
  responseMs: number | null;
  error: string | null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function attempt(target: CheckTarget): Promise<CheckResult> {
  // Validated on every attempt, and before the clock starts, so DNS time is
  // not counted as the site's response time.
  await assertSafeUrl(target.url);

  const startedAt = performance.now();

  const response = await fetch(target.url, {
    method: target.method,
    // Redirects are never followed. Following one would let a monitored site
    // bounce us to localhost or the metadata endpoint, past the guard above.
    redirect: "manual",
    signal: AbortSignal.timeout(target.timeoutMs),
  });

  const responseMs = Math.round(performance.now() - startedAt);

  // Discard the body without buffering it. A monitored 50 MB file must never
  // land in worker memory, but leaving the body unconsumed leaks the socket.
  await response.body?.cancel();

  // 2xx and 3xx are both up: a redirect is still the server responding.
  const isUp = response.status >= 200 && response.status < 400;

  return {
    status: isUp ? "up" : "down",
    statusCode: response.status,
    responseMs: isUp ? responseMs : null,
    error: isUp ? null : `HTTP ${response.status}`,
  };
}

// Retries live here rather than in BullMQ. One dropped packet must not
// fabricate an incident: uptime is derived from incidents rather than
// sampled, so a false "down" can never be averaged away later.
export async function runCheck(target: CheckTarget): Promise<CheckResult> {
  let result: CheckResult = {
    status: "down",
    statusCode: null,
    responseMs: null,
    error: "No attempt made",
  };

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (i > 0) await delay(RETRY_DELAY_MS[i - 1]);

    try {
      result = await attempt(target);
      if (result.status === "up") return result;
    } catch (error) {
      // A blocked URL is a policy decision, not an outage — let it out.
      if (error instanceof UnsafeUrlError) throw error;

      result = {
        status: "down",
        statusCode: null,
        responseMs: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return result;
}
