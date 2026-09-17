//apps/worker/src/rollup.ts
import { getResponseSamples } from "@webpulse/shared";
import { logger } from "./logger.js";
import { queueConnection } from "./redis.js";
import { db } from "./db.js";

// Yesterday in UTC, as YYYY-MM-DD.
function previousUtcDate(now: Date): string {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function utcDayBounds(day: string): { start: number; end: number } {
  const start = Date.parse(`${day}T00:00:00.000Z`);
  return { start, end: start + 86_400_000 };
}

// Samples are kept for ~48h precisely so this can still see all of yesterday
// when it runs just after midnight.
async function averageResponseMs(
  monitorId: string,
  day: string,
): Promise<number | null> {
  const { start, end } = utcDayBounds(day);

  const samples = await getResponseSamples(queueConnection, monitorId).catch(
    () => [],
  );

  const inDay = samples.filter((s) => s.timestamp >= start && s.timestamp < end);
  if (inDay.length === 0) return null;

  const total = inDay.reduce((sum, s) => sum + s.responseMs, 0);
  return Math.round(total / inDay.length);
}

// One row per monitor per day. Paused monitors are included: their uptime is
// still derived from incidents, and pausing resolves any open one.
export async function runDailyRollup(now: Date = new Date()): Promise<void> {
  const day = previousUtcDate(now);

  const monitors = await db.monitor.findMany({ select: { id: true } });

  let written = 0;

  for (const monitor of monitors) {
    const avg = await averageResponseMs(monitor.id, day);

    try {
      await db.$queryRaw`
        SELECT record_daily_uptime(${monitor.id}::uuid, ${day}::date, ${avg}::integer)
      `;
    } catch (error) {
      // One bad monitor must not abandon the rest of the rollup.
      logger.error("Daily rollup failed for monitor", {
        monitorId: monitor.id,
        day,
        error: String(error),
      });
      continue;
    }

    written++;
  }

  logger.info("Daily rollup complete", { day, monitors: monitors.length, written });
}
