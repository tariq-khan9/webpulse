"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type GoogleButtonProps = {
  onError: (message: string | null) => void;
};

export function GoogleButton({ onError }: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleSignIn() {
    onError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // `flow=oauth` survives the round trip so /auth/message can tell an
        // OAuth failure apart from an expired email link.
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?flow=oauth`,
      },
    });

    // On success the browser leaves for Google's consent screen, so the
    // spinner stays up until the page unloads. Only a failed handoff lands here.
    if (error) {
      onError(error.message);
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="h-11 w-full rounded-full border-white/10 bg-white/5 font-medium text-white hover:bg-white/10 hover:text-white"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </>
      )}
    </Button>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a10.99 10.99 0 0 0-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}