"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CircleCheck, Info, TriangleAlert } from "lucide-react";

import { authMessages, type AuthMessageType } from "@/lib/auth-messages";
import { ResendConfirmationDialog } from "@/components/dialogs/resend-email-dialog";
import { AuthBackground } from "@/components/auth/auth-background";

const primaryButtonClass =
  "inline-flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 px-6 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-blue-400 hover:to-violet-400";

const secondaryButtonClass =
  "inline-flex h-11 w-full items-center justify-center rounded-lg border border-indigo-400/40 bg-indigo-500/5 px-6 text-sm font-medium text-slate-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white";

function resolveMessageType(
  searchParams: URLSearchParams,
): AuthMessageType {
  const messageType = searchParams.get("webpulse");

  // Custom WebPulse URL
  // /auth/message?webpulse=notify&notification_code=...
  // /auth/message?webpulse=error&error_code=...
  if (messageType === "notify" || messageType === "error") {
    const paramName =
      messageType === "notify" ? "notification_code" : "error_code";
    const code = searchParams.get(paramName);

    if (code && code in authMessages) {
      return code as AuthMessageType;
    }

    return "auth-error";
  }

  // Supabase-generated error URL
  // /auth/message?error=access_denied&error_code=otp_expired...
  if (searchParams.get("error_code") === "otp_expired") {
    return "link-expired";
  }

  // Failed Google sign-in, tagged by GoogleButton's `flow=oauth` redirect.
  // Reaching /auth/message at all means it failed — success goes to /dashboard.
  if (searchParams.get("flow") === "oauth") {
    return searchParams.get("error") === "access_denied"
      ? "oauth-cancelled"
      : "oauth-error";
  }

  return "auth-error";
}

export default function AuthMessagePage() {
  return (
    <Suspense fallback={null}>
      <AuthMessageContent />
    </Suspense>
  );
}

function AuthMessageContent() {
  const searchParams = useSearchParams();
  const [resendOpen, setResendOpen] = useState(false);

  const type = resolveMessageType(searchParams);
  const message = authMessages[type];
  const isLinkExpired = type === "link-expired";
  const isRecoveryFlow = searchParams.get("flow") === "recovery";
  const showResendTrigger = isLinkExpired || type === "signup-confirmation-sent";

  const Icon =
    message.variant === "success"
      ? CircleCheck
      : message.variant === "error"
        ? TriangleAlert
        : Info;

  return (
    <AuthBackground>
      <div className="relative w-full max-w-lg">
        {/* Message card */}
        <div className="rounded-2xl border border-white/10 bg-[#0b1324]/90 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/10 shadow-lg shadow-indigo-500/10">
              <Icon className="h-8 w-8 text-indigo-400" strokeWidth={1.8} />
            </div>
          </div>

          {/* Message */}
          <div className="mt-7 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {message.title}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400 sm:text-base">
              {message.description}
            </p>
          </div>

          {/* Actions */}
          {(message.primaryAction || message.secondaryAction || showResendTrigger) && (
            <div className="mx-auto mt-8 flex w-full max-w-sm flex-col gap-3">
              {showResendTrigger &&
                (isLinkExpired && isRecoveryFlow ? (
                  <Link href="/auth/forgot-password" className={primaryButtonClass}>
                    Request new link
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResendOpen(true)}
                    className={primaryButtonClass}
                  >
                    Resend confirmation email
                  </button>
                ))}

              {message.primaryAction && (
                <Link
                  href={message.primaryAction.href}
                  className={showResendTrigger ? secondaryButtonClass : primaryButtonClass}
                >
                  {message.primaryAction.label}
                  {!showResendTrigger && <span className="ml-2">→</span>}
                </Link>
              )}

              {message.secondaryAction && (
                <Link href={message.secondaryAction.href} className={secondaryButtonClass}>
                  {message.secondaryAction.label}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Branding */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-600">
            WebPulse · Uptime monitoring for modern websites
          </p>
        </div>
      </div>

      <ResendConfirmationDialog open={resendOpen} onOpenChange={setResendOpen} />
    </AuthBackground>
  );
}
