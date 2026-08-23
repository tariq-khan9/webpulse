"use client";

import { useState, useTransition } from "react";
import { Loader2, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";

import {
  createMonitorAction,
  deleteMonitorAction,
  setMonitorPausedAction,
  updateMonitorAction,
} from "@/app/(dashboard)/dashboard/monitor-actions";
import {
  MonitorFormDialog,
  type MonitorFormValues,
} from "@/components/dashboard/monitor-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface MonitorView {
  id: string;
  name: string;
  url: string;
  status: "up" | "down" | "unknown";
  isPaused: boolean;
  checkIntervalSeconds: number;
  lastCheckedAt: string | null;
  lastResponseMs: number | null;
}

const EMPTY_FORM: MonitorFormValues = { name: "", url: "" };

function formatInterval(seconds: number): string {
  if (seconds % 60 === 0) return `every ${seconds / 60} min`;
  return `every ${seconds}s`;
}

function formatLastChecked(value: string | null): string {
  if (!value) return "not checked yet";

  const elapsedSeconds = Math.round((Date.now() - Date.parse(value)) / 1000);
  if (elapsedSeconds < 60) return "checked just now";
  if (elapsedSeconds < 3600) return `checked ${Math.floor(elapsedSeconds / 60)}m ago`;
  if (elapsedSeconds < 86400) return `checked ${Math.floor(elapsedSeconds / 3600)}h ago`;
  return `checked ${Math.floor(elapsedSeconds / 86400)}d ago`;
}

function StatusBadge({ monitor }: { monitor: MonitorView }) {
  const { label, dot, text } = monitor.isPaused
    ? { label: "Paused", dot: "bg-slate-500", text: "text-slate-400" }
    : monitor.status === "up"
      ? { label: "Up", dot: "bg-emerald-400", text: "text-emerald-400" }
      : monitor.status === "down"
        ? { label: "Down", dot: "bg-red-400", text: "text-red-400" }
        : { label: "Pending", dot: "bg-amber-400", text: "text-amber-400" };

  return (
    <span className={`inline-flex items-center gap-2 text-sm font-medium ${text}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export function MonitorsPanel({
  monitors,
  monitorLimit,
  planStatus,
}: {
  monitors: MonitorView[];
  monitorLimit: number;
  planStatus: string;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MonitorView | null>(null);
  const [deleting, setDeleting] = useState<MonitorView | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const atLimit = monitors.length >= monitorLimit;

  function openCreate() {
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(monitor: MonitorView) {
    setEditing(monitor);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(values: MonitorFormValues) {
    setFormError(null);

    const result = editing
      ? await updateMonitorAction({ id: editing.id, ...values })
      : await createMonitorAction(values);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    setFormOpen(false);
    setEditing(null);
  }

  function handleTogglePause(monitor: MonitorView) {
    setRowError(null);
    setPendingId(monitor.id);

    startTransition(async () => {
      const result = await setMonitorPausedAction({
        id: monitor.id,
        paused: !monitor.isPaused,
      });
      if (!result.success) setRowError(result.error);
      setPendingId(null);
    });
  }

  function handleDelete(monitor: MonitorView) {
    setRowError(null);
    setPendingId(monitor.id);

    startTransition(async () => {
      const result = await deleteMonitorAction({ id: monitor.id });
      if (!result.success) setRowError(result.error);
      setPendingId(null);
      setDeleting(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {monitors.length} of {monitorLimit} used
          <span className="mx-2 text-slate-600">·</span>
          {planStatus === "active" ? "Pro plan" : "Free plan"}
        </p>

        <Button
          onClick={openCreate}
          disabled={atLimit}
          className="h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add monitor
        </Button>
      </div>

      {atLimit ? (
        <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-300">
          You have used every monitor on your plan. Remove one, or upgrade for
          more.
        </p>
      ) : null}

      {rowError ? (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400">
          {rowError}
        </p>
      ) : null}

      {monitors.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center shadow-2xl shadow-black/40">
          <p className="text-slate-300">No monitors yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Add a URL and WebPulse will start checking it right away.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {monitors.map((monitor) => {
            const busy = isPending && pendingId === monitor.id;

            return (
              <li
                key={monitor.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <StatusBadge monitor={monitor} />
                      <h2 className="truncate font-medium text-white">
                        {monitor.name}
                      </h2>
                    </div>

                    <p className="mt-1 truncate text-sm text-slate-400">
                      {monitor.url}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {formatInterval(monitor.checkIntervalSeconds)}
                      <span className="mx-2">·</span>
                      {monitor.isPaused
                        ? "paused"
                        : formatLastChecked(monitor.lastCheckedAt)}
                      {monitor.lastResponseMs !== null && !monitor.isPaused ? (
                        <>
                          <span className="mx-2">·</span>
                          {monitor.lastResponseMs} ms
                        </>
                      ) : null}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {busy ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin text-slate-400" />
                    ) : null}

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={busy}
                      title={monitor.isPaused ? "Resume" : "Pause"}
                      onClick={() => handleTogglePause(monitor)}
                      className="text-slate-400 hover:text-white"
                    >
                      {monitor.isPaused ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <Pause className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={busy}
                      title="Edit"
                      onClick={() => openEdit(monitor)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={busy}
                      title="Delete"
                      onClick={() => setDeleting(monitor)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <MonitorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        mode={editing ? "edit" : "create"}
        serverError={formError}
        defaultValues={
          editing ? { name: editing.name, url: editing.url } : EMPTY_FORM
        }
      />

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent className="border-white/10 bg-[#0b1324] text-white shadow-2xl shadow-black/40 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Delete monitor
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-400">
              {deleting?.name} and its incident history will be permanently
              removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              className="h-11 rounded-full border-white/10 bg-white/5 px-5 text-slate-300 hover:bg-white/10"
              onClick={() => setDeleting(null)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={isPending}
              className="h-11 rounded-full px-5 font-semibold"
              onClick={() => deleting && handleDelete(deleting)}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
