import React from "react";

import { ProfileForm } from "@/components/dashboard/profile-form";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

const Page = async () => {
  const { user } = await requireSession();

  // Google-only accounts have no password to verify or change.
  const passwordAccount = await db.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
    select: { id: true },
  });

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-slate-400">{user.email}</p>
      </header>

      <ProfileForm
        currentName={user.name}
        hasPasswordLogin={Boolean(passwordAccount)}
      />
    </>
  );
};

export default Page;
