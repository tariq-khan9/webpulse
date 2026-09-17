"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

const links = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Analytics", href: "#analytics" },
  { label: "Pricing", href: "#pricing" },
];

// Signed-in visitors get a Dashboard link instead of the sign-in/sign-up pair.
export function Navbar({ isSignedIn }: { isSignedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header id="top" className="fixed inset-x-0 top-0 z-50">
      <div
        className={`mx-auto flex h-16 max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
          scrolled
            ? "mt-2 max-w-6xl rounded-2xl border border-border glass shadow-lg shadow-black/20"
            : ""
        }`}
      >
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isSignedIn ? null : (
            <Button
              variant="ghost"
              size="lg"
              nativeButton={false}
              render={<a href="/auth/login" />}
            >
              Sign In
            </Button>
          )}
          <Button
            size="lg"
            nativeButton={false}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90"
            render={<a href={isSignedIn ? "/dashboard" : "/auth/signup"} />}
          >
            {isSignedIn ? "Dashboard" : "Get Started"}
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mx-3 mt-2 rounded-2xl border border-border bg-popover p-4 shadow-xl shadow-black/40 md:hidden">
          <nav className="flex flex-col">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            {isSignedIn ? null : (
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={<a href="/auth/login" />}
              >
                Sign In
              </Button>
            )}
            <Button
              size="lg"
              nativeButton={false}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
              render={<a href={isSignedIn ? "/dashboard" : "/auth/signup"} />}
            >
              {isSignedIn ? "Dashboard" : "Get Started"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
