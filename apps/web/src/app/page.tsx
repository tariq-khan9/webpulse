import { Navbar } from "@/components/navbar";
import LandingPage from "@/components/landing";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <LandingPage />
      </main>
      <Footer />
    </div>
  );
}
