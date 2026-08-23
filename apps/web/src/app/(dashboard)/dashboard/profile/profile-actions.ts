"use server";

import { createClient } from "@/lib/supabase/server";

type UpdateNameInput = {
  name: string;
};

type UpdateNameResult = { success: true } | { success: false; error: string };

export async function updateProfileNameAction({
  name,
}: UpdateNameInput): Promise<UpdateNameResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    data: { full_name: name },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

type UpdatePasswordResult = { success: true } | { success: false; error: string };

export async function updateProfilePasswordAction({
  currentPassword,
  newPassword,
}: UpdatePasswordInput): Promise<UpdatePasswordResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { success: false, error: "You must be signed in to do this." };
  }

  const hasPasswordLogin = user.identities?.some(
    (identity) => identity.provider === "email",
  );

  if (!hasPasswordLogin) {
    return {
      success: false,
      error: "Your account signs in with Google and has no password to change.",
    };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return { success: false, error: "Current password is incorrect." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
