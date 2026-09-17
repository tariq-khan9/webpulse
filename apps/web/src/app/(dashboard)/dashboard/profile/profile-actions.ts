"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { authErrorMessage } from "@/lib/auth-errors";

type UpdateNameInput = {
  name: string;
};

type UpdateNameResult = { success: true } | { success: false; error: string };

// Both actions pass the request headers, so Better Auth acts on the caller's
// own session and rejects the request when there is none.
export async function updateProfileNameAction({
  name,
}: UpdateNameInput): Promise<UpdateNameResult> {
  try {
    await auth.api.updateUser({ body: { name }, headers: await headers() });
  } catch (error) {
    return { success: false, error: authErrorMessage(error) };
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
  try {
    // Verifies the current password itself, and signs out every other device.
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError && error.body?.code === "INVALID_PASSWORD") {
      return { success: false, error: "Current password is incorrect." };
    }
    if (error instanceof APIError && error.body?.code === "CREDENTIAL_ACCOUNT_NOT_FOUND") {
      return {
        success: false,
        error: "Your account signs in with Google and has no password to change.",
      };
    }
    return { success: false, error: authErrorMessage(error) };
  }

  return { success: true };
}
