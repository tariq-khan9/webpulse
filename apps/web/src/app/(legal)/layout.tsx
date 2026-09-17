import Link from "next/link";

import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link href="/" aria-label="WebPulse home">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <article className="space-y-4 text-[15px] leading-relaxed text-muted-foreground [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-foreground [&_h2]:pt-4 [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline">
          {children}
        </article>
      </main>

      <Footer />
    </div>
  );
}
