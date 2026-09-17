"use server";

import { auth } from "@/lib/auth";
import { authErrorMessage } from "@/lib/auth-errors";
import { EMAIL_CONFIRMED_URL } from "@/lib/auth-messages";

type ResendResult = { success: true } | { success: false; error: string };

export async function resendConfirmationAction({
  email,
}: {
  email: string;
}): Promise<ResendResult> {
  try {
    await auth.api.sendVerificationEmail({
      body: { email, callbackURL: EMAIL_CONFIRMED_URL },
    });
  } catch (error) {
    return { success: false, error: authErrorMessage(error) };
  }

  return { success: true };
}
