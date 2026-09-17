import { Navbar } from "@/components/navbar";
import LandingPage from "@/components/landing";
import { Footer } from "@/components/footer";
import { getSession } from "@/lib/session";

export default async function Page() {
  const session = await getSession();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar isSignedIn={Boolean(session)} />
      <main>
        <LandingPage />
      </main>
      <Footer />
    </div>
  );
}
