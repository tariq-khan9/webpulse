import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-card/50 px-6 py-16 text-center sm:px-12 sm:py-20">
        {/* glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[110px]" />
          <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-accent/20 blur-[100px]" />
          <div className="absolute inset-0 grid-bg opacity-40 mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
        </div>

        <h2 className="mx-auto max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          Don&apos;t wait for your users to tell you your website is down.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
          Start monitoring your websites today and know exactly when something
          goes wrong.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            nativeButton={false}
            className="h-12 w-full rounded-xl bg-linear-to-r from-primary to-accent px-6 text-base text-primary-foreground shadow-xl shadow-primary/30 hover:opacity-90 sm:w-auto"
            render={<a href="/auth/signup" />}
          >
            Start Monitoring for Free
            <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            className="h-12 w-full rounded-xl px-6 text-base sm:w-auto"
            render={<a href="#analytics" />}
          >
            <Play className="size-4" />
            View Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
