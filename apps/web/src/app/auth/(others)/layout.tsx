import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#070b14]">
      {/* Branding panel — hidden below lg, shown as a fixed side panel on desktop */}
      <aside className="relative hidden lg:pl-12 w-[100%] shrink-0 overflow-hidden border-r border-white/10 bg-[#0a0e17] lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-[110px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-20 h-[420px] w-[420px] rounded-full bg-purple-500/20 blur-[110px]"
          aria-hidden
        />

        <div className="relative  z-10 p-10 ">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
          </Link>
          {children}
        </div>
      </aside>
    </div>
  );
}
