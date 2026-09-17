import { Hero } from "./hero";
import { TrustStrip } from "./trust-strip";
import { Features } from "./features";
import { DashboardPreview } from "./dashboard-preview";
import { MonitorSection } from "./monitor-section";
import { IncidentSection } from "./incident-section";
import { HowItWorks } from "./how-it-works";
import { Analytics } from "./analytics";
import { Pricing } from "./pricing";
import { CTA } from "./cta";

const LandingPage = () => {
  return (
    <div>
      <Hero />
      <DashboardPreview />
      <TrustStrip />
      <Features />
      <MonitorSection />
      <IncidentSection />
      <HowItWorks />
      <Analytics />
      <Pricing />
      <CTA />
    </div>
  );
};

export default LandingPage;
