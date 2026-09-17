"use server";

import { auth } from "@/lib/auth";
import { authErrorMessage } from "@/lib/auth-errors";
import { EMAIL_CONFIRMED_URL } from "@/lib/auth-messages";

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
  try {
    // No session yet: email verification is required, and the emailed link
    // signs the user in once confirmed.
    await auth.api.signUpEmail({
      body: { name, email, password, callbackURL: EMAIL_CONFIRMED_URL },
    });
  } catch (error) {
    return { success: false, error: authErrorMessage(error) };
  }

  return { success: true };
}
