"use server";

import { createClient } from "@/lib/supabase/server";

type LoginInput = {
  email: string;
  password: string;
};

type LoginResult = { success: true } | { success: false; error: string };

export async function LoginAction({
  email,
  password,
}: LoginInput): Promise<LoginResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
