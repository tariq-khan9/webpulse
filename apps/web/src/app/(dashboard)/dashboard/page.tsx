import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/auth/logout/action";
import { MonitorsPanel } from "@/components/dashboard/monitors-panel";
import { withLiveStatus } from "@/lib/monitor-view";
import { createClient } from "@/lib/supabase/server";

const Page = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // RLS scopes both of these to the signed-in user.
  const [{ data: rows }, { data: subscription }] = await Promise.all([
    supabase
      .from("monitors")
      .select("id, name, url, status, is_paused, check_interval_seconds, last_checked_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("subscriptions")
      .select("status, monitor_limit")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const monitors = await withLiveStatus(rows ?? []);

  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Monitors</h1>
            <p className="mt-1 text-sm text-slate-400">
              Sites and APIs WebPulse is watching for you.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/profile"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Profile
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <MonitorsPanel
          monitors={monitors}
          monitorLimit={subscription?.monitor_limit ?? 0}
          planStatus={subscription?.status ?? "inactive"}
        />
      </div>
    </main>
  );
};

export default Page;
