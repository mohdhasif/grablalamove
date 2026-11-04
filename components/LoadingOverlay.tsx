"use client";

import type { MouseEvent } from "react";

const swallow = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

/** Full-screen popup shown while something is processing. Blocks taps so nothing is submitted twice. */
export function LoadingOverlay({ show, label = "Processing…" }: { show: boolean; label?: string }) {
  if (!show) return null;
  return (
    <div role="status" aria-live="assertive" aria-busy="true" onClick={swallow}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex min-w-48 flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 text-zinc-900 shadow-xl dark:bg-zinc-900 dark:text-zinc-100">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-600 dark:border-zinc-700 dark:border-t-emerald-500" />
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-zinc-500">Please wait…</p>
      </div>
    </div>
  );
}
