import Link from "next/link";
import { Logo } from "@/components/logo";

export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-card">
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-20 h-[420px] w-[420px] rounded-full bg-purple-500/20 blur-[110px]"
        aria-hidden
      />

      <Link href="/" className="relative z-10 inline-flex w-fit items-center gap-2.5 p-6 sm:p-10">
        <Logo />
      </Link>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-12 sm:px-10">
        {children}
      </div>
    </div>
  );
}
