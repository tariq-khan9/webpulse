"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { resendConfirmationAction } from "@/app/auth/message/action";

const resendSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
});

type FormValues = z.infer<typeof resendSchema>;

type ResendConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ResendConfirmationDialog({
  open,
  onOpenChange,
}: ResendConfirmationDialogProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);

    const result = await resendConfirmationAction({ email: values.email });

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    onOpenChange(false);
    router.push("/auth/message?webpulse=notify&notification_code=confirmation-resent");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#0b1324] text-white shadow-2xl shadow-black/40 sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10">
            <Mail className="h-5 w-5 text-indigo-400" />
          </div>

          <DialogTitle className="text-xl font-semibold text-white">
            Resend confirmation email
          </DialogTitle>

          <DialogDescription className="text-sm leading-6 text-slate-400">
            Enter the email address you used when creating your account.
            We&apos;ll send you a new confirmation link.
          </DialogDescription>
        </DialogHeader>

        {serverError ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400">
            {serverError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-2 space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="resend-email"
              className="text-sm font-medium text-slate-300"
            >
              Email address
            </Label>

            <Input
              id="resend-email"
              type="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              className={`h-11 border-white/10 bg-white/[0.03] text-white placeholder:text-slate-600 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20
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
            className="h-11 w-full bg-gradient-to-r from-blue-500 to-violet-500 font-medium text-white shadow-lg shadow-indigo-500/20 hover:from-blue-400 hover:to-violet-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send confirmation email"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
