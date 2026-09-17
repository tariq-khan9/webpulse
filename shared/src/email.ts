//shared/src/email.ts
import { Resend } from "resend";

export type SendEmail = (to: string, subject: string, html: string) => Promise<void>;

// Both apps send email: web for account emails (verification, password
// reset), the worker for down/recovery alerts.
export function createEmailSender(apiKey: string, from: string): SendEmail {
  const resend = new Resend(apiKey);

  return async (to, subject, html) => {
    const { error } = await resend.emails.send({ from, to, subject, html });

    if (error) {
      throw new Error(`Resend rejected the email: ${error.message}`);
    }
  };
}

// User-supplied values (names, URLs) end up inside HTML emails.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
