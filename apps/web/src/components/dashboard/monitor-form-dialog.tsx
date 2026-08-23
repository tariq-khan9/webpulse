"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const monitorSchema = z.object({
  name: z.string().trim().min(1, "Give the monitor a name.").max(100),
  url: z
    .string()
    .trim()
    .min(1, "Enter the URL to monitor.")
    .url("Enter a valid URL, including https://"),
});

export type MonitorFormValues = z.infer<typeof monitorSchema>;

const inputClass = (hasError: boolean) =>
  `h-11 rounded-lg border-white/10 bg-[#0a0e17] text-white placeholder:text-slate-500
   focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/30
   ${hasError ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`;

export function MonitorFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  serverError,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MonitorFormValues) => Promise<void>;
  defaultValues: MonitorFormValues;
  serverError: string | null;
  mode: "create" | "edit";
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MonitorFormValues>({
    resolver: zodResolver(monitorSchema),
    defaultValues,
  });

  // The dialog is reused for every monitor, so the fields have to be reset
  // whenever it reopens for a different one.
  useEffect(() => {
    if (open) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultValues.name, defaultValues.url]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#0b1324] text-white shadow-2xl shadow-black/40 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {mode === "create" ? "Add a monitor" : "Edit monitor"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-slate-400">
            We&apos;ll check this URL on a schedule and email you when it goes
            down or recovers.
          </DialogDescription>
        </DialogHeader>

        {serverError ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400">
            {serverError}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-2 space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="monitor-name" className="text-sm font-medium text-slate-300">
              Name
            </Label>
            <Input
              id="monitor-name"
              placeholder="Marketing site"
              aria-invalid={Boolean(errors.name)}
              className={inputClass(Boolean(errors.name))}
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monitor-url" className="text-sm font-medium text-slate-300">
              URL
            </Label>
            <Input
              id="monitor-url"
              placeholder="https://example.com"
              aria-invalid={Boolean(errors.url)}
              className={inputClass(Boolean(errors.url))}
              {...register("url")}
            />
            {errors.url ? (
              <p className="text-sm text-red-400">{errors.url.message}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full border-white/10 bg-white/5 px-5 text-slate-300 hover:bg-white/10"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-opacity hover:opacity-90"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "create" ? (
                "Add monitor"
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
