"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginAction } from "@/app/auth/(signup-login)/login/action";
import { GoogleButton } from "@/components/auth/google-button";

// Schema replaces the old `validate()` function. Messages are kept
// identical to the original hand-written checks.
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(1, "Create a password.")
    .min(8, "Use at least 8 characters."),
});

type FormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      const result = await LoginAction({
        email: values.email,
        password: values.password,
      });
      if (result.success) {
        router.push("/dashboard");
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
            Login to your account
          </h1>
          <p className="text-sm text-slate-400">
            Start monitoring your uptime in minutes.
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-slate-300"
              >
                Password
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
                Login
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-wider text-slate-500">
            Or continue with
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <GoogleButton onError={setFormError} />

        <p className="mt-7 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            Sign Up
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        By continuing, you agree to WebPulse&apos;s{" "}
        <Link href="/terms" className="text-slate-400 hover:text-slate-300">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-slate-400 hover:text-slate-300">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
