// src/app/email-error/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Mail } from "lucide-react";

type ErrorInfo = {
  title: string;
  message: string;
  action: "resend" | "login" | "retry";
};

function getErrorInfo(errorCode: string | null): ErrorInfo {
  switch (errorCode) {
    case "otp_expired":
      return {
        title: "This link has expired",
        message:
          "Confirmation and password reset links are only valid for a limited time. Request a new one to continue.",
        action: "resend",
      };
    case "access_denied":
      return {
        title: "This link is no longer valid",
        message:
          "The link may have already been used or was denied. Please try signing in again.",
        action: "login",
      };
    default:
      return {
        title: "We couldn't verify your link",
        message:
          "Something went wrong while confirming your request. Please try again.",
        action: "retry",
      };
  }
}

export default function EmailErrorPage() {
  const searchParams = useSearchParams();
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Query string first — this is what middleware/proxy preserves
    let code = searchParams.get("error_code");

    // Fallback: some flows may only carry the error in the hash
    if (!code && window.location.hash.includes("error=")) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      code = hashParams.get("error_code");
    }

    setErrorCode(code);
    setReady(true);

    // Clean the URL bar so refresh/share doesn't expose the raw error
    window.history.replaceState({}, "", window.location.pathname);
  }, [searchParams]);

  if (!ready) return null;

  const { title, message, action } = getErrorInfo(errorCode);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-transparent px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center gap-4 rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>

          <div className="w-full pt-2 flex flex-col gap-2">
            {action === "resend" && (
              <Link
                href="/resend-link"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Request a new link
              </Link>
            )}

            <Link
              href="/login"
              className={
                action === "resend"
                  ? "text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
                  : "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              }
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
