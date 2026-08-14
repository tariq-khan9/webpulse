import { Activity } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <a
      href="#top"
      className={`group inline-flex items-center gap-2 ${className}`}
      aria-label="WebPulse home"
    >
      <span className="relative flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
        <Activity
          className="size-4 text-primary-foreground"
          strokeWidth={2.5}
        />
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-success ring-2 ring-background pulse-dot" />
      </span>
      <span className="text-lg font-semibold tracking-tight">WebPulse</span>
    </a>
  );
}
