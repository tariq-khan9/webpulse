import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-10 sm:pt-40 sm:pb-16">
      {/* Ambient glow + grid backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-[10%] top-[20%] h-[320px] w-[320px] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-primary" />
            Simple uptime monitoring for modern websites
          </span>
        </div>

        <h1
          className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight animate-fade-up sm:text-6xl lg:text-7xl"
          style={{ animationDelay: '0.05s' }}
        >
          Know when your website goes down.
          <span className="mt-2 block text-gradient">
            Stay ahead of every incident.
          </span>
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground animate-fade-up sm:text-lg"
          style={{ animationDelay: '0.1s' }}
        >
          Monitor uptime, response times, and incidents from one simple
          dashboard. Get alerted when something goes wrong and keep your users
          informed.
        </p>

        <div
          className="mt-8 flex flex-col items-center justify-center gap-3 animate-fade-up sm:flex-row"
          style={{ animationDelay: '0.15s' }}
        >
          <Button
            size="lg"
            nativeButton={false}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-primary to-accent px-6 text-base text-primary-foreground shadow-xl shadow-primary/30 hover:opacity-90 sm:w-auto"
            render={<a href="#pricing" />}
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

        <p
          className="mt-4 text-sm text-muted-foreground animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          No credit card required · Set up in minutes
        </p>
      </div>
    </section>
  )
}
