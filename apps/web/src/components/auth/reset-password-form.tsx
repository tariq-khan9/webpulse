"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "@/app/auth/(simple)/reset-password/action";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Create a password.")
      .min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      const result = await resetPasswordAction({ password: values.password });
      if (result.success) {
        router.push(
          "/auth/message?webpulse=notify&notification_code=password-reset-success",
        );
      } else {
        setFormError(result.error);
      }
    } catch {
      setFormError("Something went wrong. Try again.");
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8">
        <div className="mb-7 space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Set a new password
          </h1>
          <p className="text-sm text-slate-400">
            Choose a new password for your account.
          </p>
        </div>

        {formError ? (
          <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400">
            {formError}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-slate-300"
            >
              New password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                aria-invalid={Boolean(errors.password)}
                className={`h-11 rounded-lg border-white/10 bg-[#0a0e17] pr-10 text-white placeholder:text-slate-500
                  focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/30
                  ${errors.password ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-slate-300"
            >
              Confirm password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                aria-invalid={Boolean(errors.confirmPassword)}
                className={`h-11 rounded-lg border-white/10 bg-[#0a0e17] pr-10 text-white placeholder:text-slate-500
                  focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/30
                  ${errors.confirmPassword ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="text-xs text-red-400">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-11 w-full rounded-full font-semibold text-white
              bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90
              shadow-lg shadow-indigo-500/20 transition-opacity
            "
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Update password
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
