"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/auth/logout/action";
import { Logo } from "@/components/logo";

const links = [
  { label: "Monitors", href: "/dashboard" },
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Profile", href: "/dashboard/profile" },
];

// Monitor detail pages live under /dashboard/monitors, so they highlight
// "Monitors" rather than nothing.
function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href || pathname.startsWith("/dashboard/monitors");
  }
  return pathname.startsWith(href);
}

const linkClass =
  "rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white/5 hover:text-white";

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/dashboard" aria-label="WebPulse dashboard">
          <Logo />
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={`${linkClass} ${
                isActive(pathname, link.href) ? "text-white" : "text-slate-400"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <form action={logoutAction}>
            <button type="submit" className={`${linkClass} text-slate-400`}>
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
