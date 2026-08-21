"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";

import { authMessages, type AuthMessageType } from "@/lib/auth-messages";
import { ResendConfirmationDialog } from "@/components/dialogs/resend-email-dialog";

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 px-6 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-blue-400 hover:to-violet-400";

const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-6 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white";

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

  const Icon =
    message.variant === "success"
      ? CircleCheck
      : message.variant === "error"
        ? TriangleAlert
        : CircleX;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070d1a] px-4 py-20">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(99, 102, 241, 0.08) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(99, 102, 241, 0.08) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Blue / purple glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[140px]" />

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
          {(message.primaryAction || message.secondaryAction || isLinkExpired) && (
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              {isLinkExpired && (
                <button
                  type="button"
                  onClick={() => setResendOpen(true)}
                  className={primaryButtonClass}
                >
                  Resend confirmation email
                </button>
              )}

              {message.primaryAction && (
                <Link
                  href={message.primaryAction.href}
                  className={isLinkExpired ? secondaryButtonClass : primaryButtonClass}
                >
                  {message.primaryAction.label}
                  {!isLinkExpired && <span className="ml-2">→</span>}
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
    </main>
  );
}
