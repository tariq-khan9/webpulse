import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { DashboardPreview } from "@/components/dashboard-preview";
import { TrustStrip } from "@/components/trust-strip";
import { Features } from "@/components/features";
import { MonitorSection } from "@/components/monitor-section";
import { IncidentSection } from "@/components/incident-section";
import { HowItWorks } from "@/components/how-it-works";
import { Analytics } from "@/components/analytics";
import { StatusPage } from "@/components/status-page";
import { Pricing } from "@/components/pricing";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <DashboardPreview />
        <TrustStrip />
        <Features />
        <MonitorSection />
        <IncidentSection />
        <HowItWorks />
        <Analytics />
        <StatusPage />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
