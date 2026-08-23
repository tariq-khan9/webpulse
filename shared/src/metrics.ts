//shared/src/metrics.ts
import type IORedis from "ioredis";
import type { MonitorStatus } from "./types.js";

// Covers the densest case (1-minute paid-tier interval) across the full 48h
// window the samples key is kept for.
const SAMPLES_MAX_LENGTH = 3000;
const SAMPLES_TTL_SECONDS = 48 * 60 * 60;

export interface MonitorLiveStatus {
  status: MonitorStatus;
  lastCheckedAt: string;
  lastResponseMs: number | null;
}

export interface ResponseSample {
  timestamp: number;
  responseMs: number;
}

function statusKey(monitorId: string): string {
  return `monitor:${monitorId}:status`;
}

function samplesKey(monitorId: string): string {
  return `monitor:${monitorId}:samples`;
}

export async function setMonitorStatus(
  redis: IORedis,
  monitorId: string,
  status: MonitorLiveStatus,
): Promise<void> {
  await redis.hset(statusKey(monitorId), {
    status: status.status,
    lastCheckedAt: status.lastCheckedAt,
    lastResponseMs: status.lastResponseMs ?? "",
  });
}

// Returns null when the monitor has never been checked (no key written yet).
export async function getMonitorStatus(
  redis: IORedis,
  monitorId: string,
): Promise<MonitorLiveStatus | null> {
  const data = await redis.hgetall(statusKey(monitorId));
  if (!data.status) return null;

  return {
    status: data.status as MonitorStatus,
    lastCheckedAt: data.lastCheckedAt,
    lastResponseMs: data.lastResponseMs ? Number(data.lastResponseMs) : null,
  };
}

// Only successful checks should be recorded here — a timeout is not a
// response time, and downtime should read as a gap in the chart.
export async function pushResponseSample(
  redis: IORedis,
  monitorId: string,
  sample: ResponseSample,
): Promise<void> {
  const key = samplesKey(monitorId);
  const value = `${sample.timestamp}:${sample.responseMs}`;

  await redis
    .multi()
    .lpush(key, value)
    .ltrim(key, 0, SAMPLES_MAX_LENGTH - 1)
    .expire(key, SAMPLES_TTL_SECONDS)
    .exec();
}

// Oldest first, so callers can plot it directly as a time series.
export async function getResponseSamples(
  redis: IORedis,
  monitorId: string,
): Promise<ResponseSample[]> {
  const raw = await redis.lrange(samplesKey(monitorId), 0, -1);

  return raw
    .map((entry) => {
      const [timestamp, responseMs] = entry.split(":");
      return { timestamp: Number(timestamp), responseMs: Number(responseMs) };
    })
    .reverse();
}
