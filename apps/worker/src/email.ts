//apps/worker/src/email.ts
import { Resend } from "resend";
import { config } from "./config.js";

const resend = new Resend(config.resendKey);

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const { error } = await resend.emails.send({
    from: config.alertFromEmail,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend rejected the email: ${error.message}`);
  }
}
