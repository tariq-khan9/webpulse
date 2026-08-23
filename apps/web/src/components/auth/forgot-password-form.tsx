"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "@/app/auth/(simple)/forgot-password/action";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
});

type FormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      const result = await forgotPasswordAction({ email: values.email });
      if (result.success) {
        router.push(
          "/auth/message?webpulse=notify&notification_code=password-reset-sent",
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
            Reset your password
          </h1>
          <p className="text-sm text-slate-400">
            Enter your email and we&apos;ll send you a link to reset it.
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
              htmlFor="email"
              className="text-sm font-medium text-slate-300"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={Boolean(errors.email)}
              className={`h-11 rounded-lg border-white/10 bg-[#0a0e17] text-white placeholder:text-slate-500
                focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/30
                ${errors.email ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs text-red-400">{errors.email.message}</p>
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
                Send reset link
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-400">
          Remembered your password?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
