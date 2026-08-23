//apps/worker/src/alerts.ts
import type { CheckResult } from "./checker.js";
import { sendEmail } from "./email.js";
import { logger } from "./logger.js";
import type { MonitorConfig } from "./monitors.js";
import { supabase } from "./supabase.js";

const UNIQUE_VIOLATION = "23505";

type AlertType = "down" | "up";

// Monitor names and URLs are user-supplied and end up inside an HTML email.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function getOwnerEmail(userId: string): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error) {
    throw new Error(`Failed to load user ${userId}: ${error.message}`);
  }

  return data.user?.email ?? null;
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
  const { data, error } = await supabase
    .from("alerts")
    .insert({ monitor_id: monitor.id, incident_id: incidentId, type })
    .select("id")
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      logger.info("Alert already recorded, not sending again", {
        monitorId: monitor.id,
        incidentId,
        type,
      });
      return;
    }
    throw new Error(`Failed to record alert: ${error.message}`);
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
  await supabase
    .from("alerts")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", data.id);

  logger.info("Alert sent", { monitorId: monitor.id, incidentId, type });
}
