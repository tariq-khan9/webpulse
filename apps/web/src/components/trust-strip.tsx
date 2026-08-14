import { Radio, Zap, ChartLine, Globe } from "lucide-react";

const benefits = [
  { icon: Radio, label: "Reliable monitoring" },
  { icon: Zap, label: "Fast incident detection" },
  { icon: ChartLine, label: "Clear uptime analytics" },
  { icon: Globe, label: "Public status pages" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-card/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-balance text-lg font-medium text-muted-foreground">
          Everything you need to keep your websites online.
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {benefits.map((b) => (
            <div
              key={b.label}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-3 text-sm"
            >
              <b.icon className="size-4 text-primary" />
              <span className="text-foreground/90">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
