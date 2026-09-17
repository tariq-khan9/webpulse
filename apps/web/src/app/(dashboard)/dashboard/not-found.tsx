import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center shadow-2xl shadow-black/40">
      <p className="text-slate-300">Monitor not found.</p>
      <p className="mt-1 text-sm text-slate-500">
        It may have been deleted, or the link is wrong.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block text-sm text-indigo-400 underline-offset-4 hover:underline"
      >
        Back to monitors
      </Link>
    </div>
  );
}
