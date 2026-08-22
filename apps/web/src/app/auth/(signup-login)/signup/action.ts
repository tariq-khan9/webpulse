"use server";

import { createClient } from "@/lib/supabase/server";

type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

type SignUpResult = { success: true } | { success: false; error: string };

export async function signUpAction({
  name,
  email,
  password,
}: SignUpInput): Promise<SignUpResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name }, // stored in auth.users.user_metadata
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
