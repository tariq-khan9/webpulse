"use server";

import { createClient } from "@/lib/supabase/server";

type ResetPasswordInput = {
  password: string;
};

type ResetPasswordResult = { success: true } | { success: false; error: string };

export async function resetPasswordAction({
  password,
}: ResetPasswordInput): Promise<ResetPasswordResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
