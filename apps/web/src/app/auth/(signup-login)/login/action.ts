"use server";

import { auth } from "@/lib/auth";
import { authErrorMessage } from "@/lib/auth-errors";

type LoginInput = {
  email: string;
  password: string;
};

type LoginResult = { success: true } | { success: false; error: string };

export async function LoginAction({
  email,
  password,
}: LoginInput): Promise<LoginResult> {
  try {
    // The nextCookies plugin sets the session cookie on this response.
    await auth.api.signInEmail({ body: { email, password } });
  } catch (error) {
    return { success: false, error: authErrorMessage(error) };
  }

  return { success: true };
}
