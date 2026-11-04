"use client";

import { useTransition } from "react";
import { deleteExpense } from "@/app/actions";
import { EXPENSE_LABEL, formatSen } from "@/lib/money";
import type { Expense } from "@/lib/orders";
import { formatTime } from "@/lib/time";
import { LoadingOverlay } from "./LoadingOverlay";

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const [pending, startTransition] = useTransition();
  if (!expenses.length) return <p className="py-4 text-center text-sm text-zinc-500">No expenses recorded.</p>;
  return (
    <>
    <LoadingOverlay show={pending} label="Deleting expense…" />
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {expenses.map((e) => (
        <li key={e.id} className="flex items-center gap-3 py-3">
          <span className="w-24 shrink-0 text-sm">{EXPENSE_LABEL[e.category]}</span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold tabular-nums text-red-600">− {formatSen(e.amountSen)}</div>
            <div className="truncate text-xs text-zinc-500">
              {formatTime(e.spentAt)}
              {e.note && ` · ${e.note}`}
            </div>
          </div>
          <button type="button" disabled={pending} aria-label="Delete"
            onClick={() => confirm("Delete this expense?") && startTransition(async () => { await deleteExpense(e.id); })}
            className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800">
            ✕
          </button>
        </li>
      ))}
    </ul>
    </>
  );
}
