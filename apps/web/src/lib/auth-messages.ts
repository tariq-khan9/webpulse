// lib/auth-messages.ts

export type AuthMessageType =
  // Signup / email confirmation
  | "signup-confirmation-sent"
  | "email-confirmed"
  | "already-confirmed"
  | "confirmation-resent"

  // Password reset
  | "password-reset-sent"
  | "password-reset-success"

  // Email change
  | "email-change-sent"
  | "email-change-confirmed"

  // Link/token errors (Supabase error_code)
  | "link-expired"
  | "link-invalid"

  // Google OAuth
  | "oauth-error"
  | "oauth-cancelled"
  | "oauth-account-exists"

  // Session / rate limiting
  | "session-expired"
  | "rate-limited"
  | "logged-out"

  // Fallback
  | "auth-error";

interface AuthMessageConfig {
  title: string;
  description: string;
  variant: "success" | "error" | "info";
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
}

export const authMessages: Record<AuthMessageType, AuthMessageConfig> = {
  // ---------- Signup / email confirmation ----------
  "signup-confirmation-sent": {
    title: "Check your inbox",
    description:
      "We've sent a confirmation link to your email. Click it to activate your account.",
    variant: "info",
    secondaryAction: { label: "Resend email", href: "/auth/resend" },
  },
  "email-confirmed": {
    title: "Email confirmed",
    description: "Your email has been verified. You're all set.",
    variant: "success",
    primaryAction: { label: "Go to dashboard", href: "/dashboard" },
  },
  "already-confirmed": {
    title: "Already confirmed",
    description: "This account has already been verified.",
    variant: "info",
    primaryAction: { label: "Sign in", href: "/auth/login" },
  },
  "confirmation-resent": {
    title: "Email resent",
    description:
      "We've sent another confirmation link. Please check your inbox.",
    variant: "info",
    primaryAction: { label: "Back to login", href: "/auth/login" },
  },

  // ---------- Password reset ----------
  "password-reset-sent": {
    title: "Reset link sent",
    description:
      "If an account exists with that email, you'll receive a password reset link shortly.",
    variant: "info",
  },
  "password-reset-success": {
    title: "Password updated",
    description: "Your password has been changed successfully.",
    variant: "success",
    primaryAction: { label: "Sign in", href: "/auth/login" },
  },

  // ---------- Email change ----------
  "email-change-sent": {
    title: "Confirm your new email",
    description: "We've sent a confirmation link to your new email address.",
    variant: "info",
  },
  "email-change-confirmed": {
    title: "Email updated",
    description: "Your email address has been changed successfully.",
    variant: "success",
    primaryAction: { label: "Go to dashboard", href: "/dashboard" },
  },

  // ---------- Link/token errors ----------
  "link-expired": {
    title: "Link expired",
    description: "This link is no longer valid. Please request a new one.",
    variant: "error",
    primaryAction: { label: "Home", href: "/" },
  },
  "link-invalid": {
    title: "Invalid link",
    description: "This link is malformed or has already been used.",
    variant: "error",
    primaryAction: { label: "Back to login", href: "/auth/login" },
  },

  // ---------- Google OAuth ----------
  "oauth-error": {
    title: "Sign in failed",
    description: "We couldn't complete sign in with Google. Please try again.",
    variant: "error",
    primaryAction: { label: "Back to login", href: "/auth/login" },
  },
  "oauth-cancelled": {
    title: "Sign in cancelled",
    description: "You cancelled the Google sign-in process.",
    variant: "info",
    primaryAction: { label: "Try again", href: "/auth/login" },
  },
  "oauth-account-exists": {
    title: "Account already exists",
    description:
      "An account with this email already exists using email/password sign-in. Try signing in that way instead.",
    variant: "error",
    primaryAction: { label: "Sign in", href: "/auth/login" },
  },

  // ---------- Session / rate limiting ----------
  "session-expired": {
    title: "Session expired",
    description:
      "You've been signed out due to inactivity. Please sign in again.",
    variant: "info",
    primaryAction: { label: "Sign in", href: "/auth/login" },
  },
  "rate-limited": {
    title: "Too many attempts",
    description: "Please wait a few minutes before trying again.",
    variant: "error",
  },
  "logged-out": {
    title: "Signed out",
    description: "You've been signed out successfully.",
    variant: "success",
    primaryAction: { label: "Sign in again", href: "/auth/login" },
  },

  // ---------- Fallback ----------
  "auth-error": {
    title: "Something went wrong",
    description: "We couldn't complete that action. Please try again.",
    variant: "error",
    primaryAction: { label: "Back to login", href: "/auth/login" },
  },
};
