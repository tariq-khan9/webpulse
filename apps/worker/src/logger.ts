//apps/worker/src/logger.ts
type Level = "debug" | "info" | "warn" | "error";

const SEVERITY: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

// Resolved on first use rather than at import, so it does not depend on this
// module being evaluated after dotenv has run.
let threshold: number | null = null;

function currentThreshold(): number {
  if (threshold === null) {
    const configured = process.env.LOG_LEVEL?.toLowerCase() as Level | undefined;
    threshold = (configured && SEVERITY[configured]) || SEVERITY.info;
  }
  return threshold;
}

function log(level: Level, message: string, context?: Record<string, unknown>): void {
  if (SEVERITY[level] < currentThreshold()) return;

  const line = `${new Date().toISOString()} ${level.toUpperCase()} ${message}`;
  const output = context ? `${line} ${JSON.stringify(context)}` : line;

  if (level === "error") {
    console.error(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  // For per-check detail. At 100 monitors on a 5-minute interval a line per
  // check is ~29k lines a day, so routine successes stay off by default and
  // `info` carries only things that actually happened.
  debug: (message: string, context?: Record<string, unknown>) => log("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => log("error", message, context),
};
