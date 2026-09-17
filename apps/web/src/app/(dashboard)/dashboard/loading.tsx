import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex justify-center py-24" role="status" aria-label="Loading">
      <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
    </div>
  );
}
