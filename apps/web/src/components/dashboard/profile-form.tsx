"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateProfileNameAction,
  updateProfilePasswordAction,
} from "@/app/(dashboard)/dashboard/profile/profile-actions";

const nameSchema = z.object({
  name: z.string().trim().min(1, "Enter your full name."),
});

type NameFormValues = z.infer<typeof nameSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(1, "Create a password.")
      .min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const cardClass =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur-sm";

const inputClass = (hasError: boolean) =>
  `h-11 rounded-lg border-white/10 bg-[#0a0e17] pr-10 text-white placeholder:text-slate-500
    focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/30
    ${hasError ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`;

const submitButtonClass =
  "h-11 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 shadow-lg shadow-indigo-500/20 transition-opacity";

const SUCCESS_MESSAGE_DURATION_MS = 4000;

function useAutoDismiss(active: boolean, onDismiss: () => void) {
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(onDismiss, SUCCESS_MESSAGE_DURATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

export function ProfileForm({
  currentName,
  hasPasswordLogin,
}: {
  currentName: string;
  hasPasswordLogin: boolean;
}) {
  return (
    <div className="w-full max-w-md space-y-6">
      <NameSection currentName={currentName} />
      {hasPasswordLogin ? <PasswordSection /> : <GoogleAccountNotice />}
    </div>
  );
}

function GoogleAccountNotice() {
  return (
    <div className={cardClass}>
      <h2 className="text-lg font-semibold text-white">Password</h2>
      <p className="mt-1 text-sm text-slate-400">
        You sign in with Google, so there&apos;s no WebPulse password to change.
        Manage your password from your Google account.
      </p>
    </div>
  );
}

function NameSection({ currentName }: { currentName: string }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: currentName },
  });

  useAutoDismiss(success, () => setSuccess(false));

  async function onSubmit(values: NameFormValues) {
    setFormError(null);
    setSuccess(false);
    const result = await updateProfileNameAction({ name: values.name });
    if (result.success) {
      setSuccess(true);
    } else {
      setFormError(result.error);
    }
  }

  return (
    <div className={cardClass}>
      <h2 className="text-lg font-semibold text-white">Profile</h2>
      <p className="mt-1 text-sm text-slate-400">Update your display name.</p>

      {formError ? (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400">
          {formError}
        </div>
      ) : null}
      {success ? (
        <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-400">
          Name updated.
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-slate-300">
            Full name
          </Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            className={inputClass(Boolean(errors.name))}
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          ) : null}
        </div>

        <Button type="submit" disabled={isSubmitting} className={submitButtonClass}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save name"}
        </Button>
      </form>
    </div>
  );
}

function PasswordSection() {
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useAutoDismiss(success, () => setSuccess(false));

  async function onSubmit(values: PasswordFormValues) {
    setFormError(null);
    setSuccess(false);
    const result = await updateProfilePasswordAction({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    if (result.success) {
      setSuccess(true);
      reset();
    } else {
      setFormError(result.error);
    }
  }

  return (
    <div className={cardClass}>
      <h2 className="text-lg font-semibold text-white">Change password</h2>
      <p className="mt-1 text-sm text-slate-400">
        Enter your current password to set a new one.
      </p>

      {formError ? (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400">
          {formError}
        </div>
      ) : null}
      {success ? (
        <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-400">
          Password updated.
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-300">
            Current password
          </Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              autoComplete="current-password"
              aria-invalid={Boolean(errors.currentPassword)}
              className={inputClass(Boolean(errors.currentPassword))}
              {...register("currentPassword")}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label={showCurrent ? "Hide password" : "Show password"}
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword ? (
            <p className="text-xs text-red-400">{errors.currentPassword.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-sm font-medium text-slate-300">
            New password
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={Boolean(errors.newPassword)}
              className={inputClass(Boolean(errors.newPassword))}
              {...register("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword ? (
            <p className="text-xs text-red-400">{errors.newPassword.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
            Confirm new password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              className={inputClass(Boolean(errors.confirmPassword))}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword ? (
            <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <Button type="submit" disabled={isSubmitting} className={submitButtonClass}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
        </Button>
      </form>
    </div>
  );
}
