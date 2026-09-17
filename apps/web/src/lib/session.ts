import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "./auth";

// Validated against the sessions table, not just the cookie. Cached per
// request, so a page and the helpers it calls share one lookup.
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

// For pages: a missing session sends the visitor to the login form.
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return session;
}
