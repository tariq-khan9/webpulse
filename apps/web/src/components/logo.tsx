import { SquareActivity } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <a
      href="#top"
      className={`group inline-flex items-center gap-2 ${className}`}
      aria-label="WebPulse home"
    >
      <SquareActivity size={44} color="#898dff" strokeWidth={1.0} />
      <span className="text-lg font-semibold tracking-tight">WebPulse</span>
    </a>
  );
}
