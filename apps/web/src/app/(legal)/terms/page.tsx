import type { Metadata } from "next";

import { LEGAL_CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/legal";
import {
  FREE_MONITOR_LIMIT,
  PAID_MONITOR_LIMIT,
} from "@/lib/tiers";

export const metadata: Metadata = {
  title: "Terms of Service — WebPulse",
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p>Last updated: {LEGAL_LAST_UPDATED}</p>

      <p>
        By creating a WebPulse account you agree to these terms. If you do not
        agree, please do not use the service.
      </p>

      <h2>The service</h2>
      <p>
        WebPulse checks the URLs you register at regular intervals, records
        their status and response times, and emails you when a site goes down or
        recovers.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Keep your login details secure; you are responsible for activity on your account.</li>
        <li>Provide a working email address — it is where alerts are sent.</li>
      </ul>

      <h2>Acceptable use</h2>
      <ul>
        <li>Only monitor websites and APIs you own or have permission to monitor.</li>
        <li>
          Do not use WebPulse to overload, probe or attack any system, or to
          reach private or internal networks.
        </li>
        <li>We may pause monitors or suspend accounts that break these rules.</li>
      </ul>

      <h2>Plans and billing</h2>
      <ul>
        <li>
          The Free plan includes {FREE_MONITOR_LIMIT} monitors checked every 5
          minutes. The Pro plan includes {PAID_MONITOR_LIMIT} monitors checked
          every minute and is billed monthly in advance through Stripe.
        </li>
        <li>
          You can cancel at any time from the billing page. Cancellation takes
          effect at the end of the current billing period, and we do not refund
          partial months.
        </li>
        <li>
          If a payment fails, your account moves to the Free plan straight away.
          Monitors beyond the Free limit are paused, not deleted, and can be
          resumed once payment succeeds.
        </li>
        <li>We will give at least 30 days&apos; notice by email before changing prices.</li>
      </ul>

      <h2>No guarantee</h2>
      <p>
        We work hard to keep WebPulse reliable, but monitoring can miss or delay
        an outage — for example if our own servers, network or email provider
        have problems. The service is provided &quot;as is&quot;, without warranties of
        any kind. Do not rely on it as your only safeguard for critical systems.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent the law allows, WebPulse is not liable for indirect or
        consequential losses, including lost revenue or data caused by downtime
        of your sites or of WebPulse. Our total liability is limited to the
        amount you paid us in the 12 months before the claim.
      </p>

      <h2>Ending your account</h2>
      <p>
        You can stop using WebPulse at any time. We may suspend or close
        accounts that break these terms. When an account is closed, its data is
        deleted as described in our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. If a change is significant, we will update
        the date above and email you before it takes effect.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
      </p>
    </>
  );
}
