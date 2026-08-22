"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/auth/message?webpulse=notify&notification_code=logged-out");
}
