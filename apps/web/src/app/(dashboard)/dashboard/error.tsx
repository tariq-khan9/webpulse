"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center shadow-2xl shadow-black/40">
      <p className="text-slate-300">Something went wrong loading this page.</p>
      <p className="mt-1 text-sm text-slate-500">
        Your monitors are still being checked. Try again in a moment.
      </p>
      <Button
        onClick={() => retry()}
        className="mt-6 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 font-semibold text-white hover:opacity-90"
      >
        Try again
      </Button>
    </div>
  );
}
