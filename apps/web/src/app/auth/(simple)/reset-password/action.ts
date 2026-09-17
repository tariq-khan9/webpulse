"use server";

import { auth } from "@/lib/auth";
import { authErrorMessage } from "@/lib/auth-errors";

type ResetPasswordInput = {
  token: string;
  password: string;
};

type ResetPasswordResult = { success: true } | { success: false; error: string };

export async function resetPasswordAction({
  token,
  password,
}: ResetPasswordInput): Promise<ResetPasswordResult> {
  try {
    await auth.api.resetPassword({ body: { token, newPassword: password } });
  } catch (error) {
    return { success: false, error: authErrorMessage(error) };
  }

  return { success: true };
}
