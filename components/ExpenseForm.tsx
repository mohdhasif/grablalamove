"use client";

import { useState, useTransition } from "react";
import { recordExpense } from "@/app/actions";
import { EXPENSE_LABEL, formatSen, parseToSen, type ExpenseCategory } from "@/lib/money";

export function ExpenseForm() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>("fuel");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const sen = parseToSen(amount);

  function submit() {
    if (!sen) return;
    startTransition(async () => {
      const res = await recordExpense({ category, amount, note });
      if (res.ok) {
        setFlash({ kind: "ok", text: `Expense saved: ${EXPENSE_LABEL[category]} ${formatSen(sen)}` });
        setAmount("");
        setNote("");
      } else setFlash({ kind: "err", text: res.error });
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="rounded-2xl border border-dashed border-zinc-300 py-3 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
        + Add expense (fuel, toll, parking…)
      </button>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Add expense</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-zinc-400">Close</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(EXPENSE_LABEL) as ExpenseCategory[]).map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-sm ${c === category ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800"}`}>
            {EXPENSE_LABEL[c]}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center rounded-xl border border-zinc-300 px-4 dark:border-zinc-700">
        <span className="font-semibold text-zinc-400">RM</span>
        <input value={amount} onChange={(e) => { setAmount(e.target.value); setFlash(null); }} inputMode="decimal"
          placeholder="0.00" className="w-full bg-transparent px-2 py-2 text-2xl font-bold tabular-nums outline-none" />
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Note (optional)"
        className="mt-3 w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm dark:border-zinc-700" />
      <button type="button" disabled={!sen || pending} onClick={submit}
        className="mt-3 w-full rounded-xl bg-zinc-900 py-3 font-bold text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900">
        {pending ? "Saving…" : "Save expense"}
      </button>
      {flash && (
        <p className={`mt-2 text-center text-sm ${flash.kind === "ok" ? "text-emerald-700" : "text-red-600"}`}>{flash.text}</p>
      )}
    </section>
  );
}
