// app/auth/callback/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin, search } = new URL(request.url);

  const code = searchParams.get("code");
  const errorCode = searchParams.get("error_code");

  const next = searchParams.get("next") ?? "/dashboard";

  // Handle other authentication errors
  if (errorCode) {
    return NextResponse.redirect(`${origin}/auth/message${search}`);
  }

  // Exchange the confirmation code for a session
  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/message${search}`);
}
