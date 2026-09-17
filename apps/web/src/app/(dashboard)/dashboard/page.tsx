import React from "react";

import { MonitorsPanel } from "@/components/dashboard/monitors-panel";
import { db } from "@/lib/db";
import { getMonitorViews } from "@/lib/monitor-view";
import { requireSession } from "@/lib/session";

const Page = async () => {
  const { user } = await requireSession();

  const [monitors, subscription] = await Promise.all([
    getMonitorViews(user.id),
    db.subscription.findUnique({
      where: { userId: user.id },
      select: { status: true, monitorLimit: true },
    }),
  ]);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Monitors</h1>
        <p className="mt-1 text-sm text-slate-400">
          Sites and APIs WebPulse is watching for you.
        </p>
      </header>

      <MonitorsPanel
        monitors={monitors}
        monitorLimit={subscription?.monitorLimit ?? 0}
        planStatus={subscription?.status ?? "inactive"}
      />
    </>
  );
};

export default Page;
