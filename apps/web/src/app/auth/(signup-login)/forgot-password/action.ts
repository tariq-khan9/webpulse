"use server";

import { createClient } from "@/lib/supabase/server";

type ForgotPasswordInput = {
  email: string;
};

type ForgotPasswordResult = { success: true } | { success: false; error: string };

export async function forgotPasswordAction({
  email,
}: ForgotPasswordInput): Promise<ForgotPasswordResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/reset-password&flow=recovery`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
