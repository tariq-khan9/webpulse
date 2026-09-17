import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Reachable without signing in. The Stripe webhook authenticates itself with
// a signature, not a session.
const PUBLIC_PATHS = new Set(["/", "/privacy", "/terms", "/api/stripe/webhook"]);

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

// Only checks that a session cookie exists, which is cheap enough to run on
// every request. It is not proof of a valid session: pages and actions still
// verify it against the database before touching user data.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(getSessionCookie(request));

  const isPublic =
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth");

  if (!hasSession && !isPublic) {
    return redirectTo(request, "/auth/login");
  }

  // A signed-in user has nothing to do on the login or signup forms. Other
  // /auth pages (messages, password reset) stay reachable with a session.
  if (hasSession && (pathname === "/auth/login" || pathname === "/auth/signup")) {
    return redirectTo(request, "/dashboard");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
