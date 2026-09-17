import { APIError } from "better-auth/api";

// Better Auth's messages are written for end users; anything else is not.
export function authErrorMessage(error: unknown): string {
  if (error instanceof APIError && error.message) return error.message;
  return "Something went wrong. Try again.";
}
