"use server";

import { auth } from "@/lib/auth";
import { authErrorMessage } from "@/lib/auth-errors";

type ForgotPasswordInput = {
  email: string;
};

type ForgotPasswordResult = { success: true } | { success: false; error: string };

export async function forgotPasswordAction({
  email,
}: ForgotPasswordInput): Promise<ForgotPasswordResult> {
  try {
    // Succeeds whether or not the account exists, so it cannot be used to
    // discover registered emails.
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: "/auth/reset-password" },
    });
  } catch (error) {
    return { success: false, error: authErrorMessage(error) };
  }

  return { success: true };
}
