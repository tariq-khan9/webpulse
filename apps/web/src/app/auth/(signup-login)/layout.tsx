import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Branding panel — hidden below lg, shown as a fixed side panel on desktop */}
      <aside className="relative hidden lg:pl-12 w-[44%] shrink-0 overflow-hidden border-r border-border bg-card lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-[110px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-20 h-[420px] w-[420px] rounded-full bg-purple-500/20 blur-[110px]"
          aria-hidden
        />

        <div className="relative z-10 p-10 ">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
          </Link>

          <h2 className="mt-16 max-w-sm text-3xl font-semibold leading-tight tracking-tight text-white">
            Never miss an incident again.
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate-400">
            Monitor uptime, response times, and incidents from one simple
            dashboard, and get an email the moment something goes down.
          </p>
        </div>

        {/* Live status signature widget, echoing the product dashboard */}
        <div className="relative z-10 pl-8 p-10">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-medium text-slate-300">
                  All systems operational
                </span>
              </div>
              <span className="font-mono text-xs text-slate-500">
                app.webpulse.dev
              </span>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-2xl font-semibold text-white">99.98%</p>
                <p className="text-xs text-slate-500">Overall uptime</p>
              </div>
              <svg
                width="140"
                height="44"
                viewBox="0 0 140 44"
                fill="none"
                className="text-indigo-400"
              >
                <polyline
                  points="0,30 18,14 34,26 50,8 66,32 82,18 98,36 114,12 140,4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
        {children}
      </main>
    </div>
  );
}
