import type { Metadata } from "next";

import { LEGAL_CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — WebPulse",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>Last updated: {LEGAL_LAST_UPDATED}</p>

      <p>
        This policy explains what WebPulse collects when you use the service,
        why, and who else handles it. We collect only what we need to monitor
        your websites and bill you.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your email address, your name if you
          provide one, and basic profile information from Google if you sign in
          with Google.
        </li>
        <li>
          <strong>Monitors:</strong> the names and URLs you ask us to monitor.
        </li>
        <li>
          <strong>Monitoring results:</strong> up/down status, HTTP status
          codes, response times, incidents, and daily uptime figures. We never
          store the content of the pages we check.
        </li>
        <li>
          <strong>Billing:</strong> if you subscribe, Stripe collects your
          payment details. We store only the Stripe customer and subscription
          identifiers and your plan status — never your card number.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To run the checks you set up and show you the results.</li>
        <li>To email you when a monitored site goes down or recovers.</li>
        <li>To send account emails such as sign-up confirmation and password resets.</li>
        <li>To manage your subscription.</li>
      </ul>
      <p>We do not sell your data or use it for advertising.</p>

      <h2>Who processes it for us</h2>
      <ul>
        <li><strong>Stripe</strong> — payments.</li>
        <li><strong>Resend</strong> — account and alert emails.</li>
        <li><strong>Google</strong> — only if you choose to sign in with Google.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use only the cookies needed to keep you signed in. We do not use
        advertising or tracking cookies.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Recent response-time samples are kept for about 48 hours. Monitors,
        incidents and daily uptime figures are kept while your account exists.
        Deleting a monitor deletes its history. When your account is deleted,
        your data is deleted with it.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask for a copy of your data, ask us to correct it, or ask us to
        delete your account by emailing{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
      </p>

      <h2>Changes</h2>
      <p>
        If we change this policy in a meaningful way, we will update the date
        above and let you know by email.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy:{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
      </p>
    </>
  );
}
