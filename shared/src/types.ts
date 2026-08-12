//shared/src/types.ts
export interface CheckJobPayload {
  monitorId: string;
  url: string;
}

export type MonitorStatus = "up" | "down";
