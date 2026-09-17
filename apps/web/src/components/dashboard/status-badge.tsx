export function StatusBadge({
  status,
  isPaused,
}: {
  status: "up" | "down" | "unknown";
  isPaused: boolean;
}) {
  const { label, dot, text } = isPaused
    ? { label: "Paused", dot: "bg-slate-500", text: "text-slate-400" }
    : status === "up"
      ? { label: "Up", dot: "bg-emerald-400", text: "text-emerald-400" }
      : status === "down"
        ? { label: "Down", dot: "bg-red-400", text: "text-red-400" }
        : { label: "Pending", dot: "bg-amber-400", text: "text-amber-400" };

  return (
    <span className={`inline-flex items-center gap-2 text-sm font-medium ${text}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
