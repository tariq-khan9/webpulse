import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { escapeHtml } from "@webpulse/shared";

import { db } from "./db";
import { sendEmail } from "./email";

function linkEmail(greetingName: string, text: string, url: string): string {
  return `<p>Hi ${escapeHtml(greetingName)},</p>
<p>${text}</p>
<p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>
<p>If you did not ask for this, you can ignore this email.</p>`;
}

// Emails are sent without awaiting, so response time does not reveal whether
// an account exists. A failed send is logged instead.
function sendInBackground(to: string, subject: string, html: string): void {
  sendEmail(to, subject, html).catch((error) => {
    console.error("Failed to send auth email", { subject, error });
  });
}

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      sendInBackground(
        user.email,
        "Reset your WebPulse password",
        linkEmail(user.name, "Use this link to choose a new password:", url),
      );
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    // A login attempt with an unverified email sends a fresh link, so an
    // expired one never locks the user out.
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      sendInBackground(
        user.email,
        "Confirm your WebPulse email",
        linkEmail(user.name, "Confirm your email address to activate your account:", url),
      );
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // Must stay last: it lets Server Actions set the session cookie.
  plugins: [nextCookies()],
});
