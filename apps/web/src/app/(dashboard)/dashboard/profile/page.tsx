import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/auth/logout/action";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { AuthBackground } from "@/components/auth/auth-background";

const Page = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const currentName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "";

  // Google-only accounts have no password to verify or change.
  const hasPasswordLogin =
    user.identities?.some((identity) => identity.provider === "email") ?? false;

  return (
    <AuthBackground>
      <form action={logoutAction} className="fixed right-6 top-6 z-20">
        <button
          type="submit"
          className="rounded-lg border border-border bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Sign out
        </button>
      </form>

      <ProfileForm
        currentName={currentName}
        hasPasswordLogin={hasPasswordLogin}
      />
    </AuthBackground>
  );
};

export default Page;
