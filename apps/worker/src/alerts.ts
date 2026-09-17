//apps/worker/src/alerts.ts
import type { CheckResult } from "./checker.js";
import { escapeHtml, isUniqueViolation } from "@webpulse/shared";
import { db } from "./db.js";
import { sendEmail } from "./email.js";
import { logger } from "./logger.js";
import type { MonitorConfig } from "./monitors.js";

type AlertType = "down" | "up";

async function getOwnerEmail(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return user?.email ?? null;
}

function buildSubject(monitor: MonitorConfig, type: AlertType): string {
  return type === "down"
    ? `${monitor.name} is down`
    : `${monitor.name} is back up`;
}

function buildBody(
  monitor: MonitorConfig,
  type: AlertType,
  result: CheckResult,
): string {
  const name = escapeHtml(monitor.name);
  const url = escapeHtml(monitor.url);
  const when = new Date().toUTCString();

  if (type === "down") {
    const reason = escapeHtml(result.error ?? "No response");
    return `<p><strong>${name}</strong> is not responding.</p>
<p>URL: ${url}<br />Reason: ${reason}<br />Detected: ${when}</p>`;
  }

  return `<p><strong>${name}</strong> is responding again.</p>
<p>URL: ${url}<br />Recovered: ${when}</p>`;
}

// The alert row is inserted before the email is sent, so the unique
// constraint on (incident_id, type) claims the alert first. A crash between
// the two loses one email; sending first would instead mail the customer the
// same outage again every time the job ran.
export async function sendAlert(
  monitor: MonitorConfig,
  incidentId: string,
  type: AlertType,
  result: CheckResult,
): Promise<void> {
  let alertId: string;
  try {
    const alert = await db.alert.create({
      data: { monitorId: monitor.id, incidentId, type },
      select: { id: true },
    });
    alertId = alert.id;
  } catch (error) {
    if (isUniqueViolation(error)) {
      logger.info("Alert already recorded, not sending again", {
        monitorId: monitor.id,
        incidentId,
        type,
      });
      return;
    }
    throw error;
  }

  const email = await getOwnerEmail(monitor.userId);
  if (!email) {
    logger.error("Monitor owner has no email address", {
      monitorId: monitor.id,
      userId: monitor.userId,
    });
    return;
  }

  await sendEmail(email, buildSubject(monitor, type), buildBody(monitor, type, result));

  // Rows left with sent_at NULL are a record of alerts that failed to send.
  await db.alert.update({
    where: { id: alertId },
    data: { sentAt: new Date() },
  });

  logger.info("Alert sent", { monitorId: monitor.id, incidentId, type });
}
