import { DashboardNav } from "@/components/dashboard/dashboard-nav";

// Layouts do not re-render on navigation, so auth is checked in each page
// (and in the proxy), never here.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <DashboardNav />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}
