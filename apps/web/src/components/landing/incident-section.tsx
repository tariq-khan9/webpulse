import {
  TriangleAlert,
  Search,
  CircleAlert,
  Activity,
  CircleCheck,
} from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";

const steps = [
  {
    label: "Incident detected",
    detail: "api.webpulse.dev returned HTTP 503",
    time: "14:07:22",
    icon: TriangleAlert,
    tone: "destructive",
  },
  {
    label: "Investigating",
    detail: "Team notified — looking into elevated error rates",
    time: "14:08:04",
    icon: Search,
    tone: "warning",
  },
  {
    label: "Identified",
    detail: "Root cause traced to a failing upstream dependency",
    time: "14:09:41",
    icon: CircleAlert,
    tone: "warning",
  },
  {
    label: "Monitoring",
    detail: "Fix deployed — watching response times recover",
    time: "14:10:58",
    icon: Activity,
    tone: "primary",
  },
  {
    label: "Resolved",
    detail: "All checks passing — incident closed",
    time: "14:11:36",
    icon: CircleCheck,
    tone: "success",
  },
] as const;

const toneMap = {
  destructive: "text-destructive bg-destructive/10 border-destructive/30",
  warning: "text-warning bg-warning/10 border-warning/30",
  primary: "text-primary bg-primary/10 border-primary/30",
  success: "text-success bg-success/10 border-success/30",
};

export function IncidentSection() {
  return (
    <section className="border-y border-border bg-card/20 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Incident Management"
          title="Turn downtime into a clear incident."
          description="When a website goes down, WebPulse creates a structured incident you can track from detection all the way to resolution."
        />

        <div className="mx-auto mt-14 max-w-2xl">
          <div className="rounded-2xl border border-border glass p-6 shadow-xl shadow-black/30 sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-destructive/10">
                  <TriangleAlert className="size-4 text-destructive" />
                </span>
                <div>
                  <p className="text-sm font-medium">API downtime</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    INC-2041 · api.webpulse.dev
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                Resolved
              </span>
            </div>

            <ol className="relative">
              {steps.map((s, i) => (
                <li key={s.label} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span
                      className={`
                        flex size-9 items-center justify-center rounded-full border
                        ${toneMap[s.tone]}
                      `}
                    >
                      <s.icon className="size-4" />
                    </span>
                    {i < steps.length - 1 && (
                      <span className="mt-1 w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pt-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <p className="text-sm font-medium">{s.label}</p>
                      <span className="font-mono text-xs text-muted-foreground">
                        {s.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
