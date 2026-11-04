"use client";

import { useRef, useState, useTransition } from "react";
import { recordOrder } from "@/app/actions";
import { LoadingOverlay } from "./LoadingOverlay";
import {
  EXTRA_PLATFORMS, PLATFORM_LABEL, calcBreakdown, formatSen, parseKmTenths, parseOptionalSen, parseToSen, senPerKm,
  type OrderStatus, type Platform,
} from "@/lib/money";

const PLATFORM_STYLE: Record<Platform, string> = {
  grab: "bg-emerald-600 text-white",
  lalamove: "bg-orange-500 text-white",
};

export function OrderForm() {
  const [platform, setPlatform] = useState<Platform>("grab");
  const [amount, setAmount] = useState("");
  const [extra, setExtra] = useState("");
  const [note, setNote] = useState("");
  const [km, setKm] = useState("");
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [busyLabel, setBusyLabel] = useState("Saving…");
  const inputRef = useRef<HTMLInputElement>(null);

  const sen = parseToSen(amount);
  const hasExtra = EXTRA_PLATFORMS.includes(platform);
  const extraSen = hasExtra ? parseOptionalSen(extra) : 0;
  const b = sen && extraSen !== null ? calcBreakdown(sen, platform, extraSen) : null;
  const kmTenths = parseKmTenths(km);
  const perKm = b && kmTenths ? senPerKm(b.netSen, kmTenths) : null;
  const valid = !!b && kmTenths !== null;

  function submit(status: OrderStatus) {
    if (!b || kmTenths === null) return;
    setBusyLabel(status === "accepted" ? "Accepting order…" : "Rejecting order…");
    startTransition(async () => {
      const res = await recordOrder({ platform, amount, extraAmount: hasExtra ? extra : "", status, distanceKm: km, note });
      if (res.ok) {
        setFlash({
          kind: "ok",
          text: status === "accepted" ? `✅ Accepted: ${formatSen(b.netSen)}` : `❌ Rejected: ${formatSen(b.netSen)}`,
        });
        setAmount("");
        setExtra("");
        setNote("");
        setKm("");
        inputRef.current?.focus();
      } else {
        setFlash({ kind: "err", text: res.error });
      }
    });
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
        {(Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => (
          <button key={p} type="button" onClick={() => setPlatform(p)}
            className={`rounded-lg py-2 font-semibold transition ${platform === p ? PLATFORM_STYLE[p] : "text-zinc-500"}`}>
            {PLATFORM_LABEL[p]}
          </button>
        ))}
      </div>

      <label className="mt-4 block text-sm text-zinc-500">{hasExtra ? "Order fare" : "Order amount"} ({PLATFORM_LABEL[platform]})</label>
      <div className="mt-1 flex items-center rounded-xl border border-zinc-300 px-4 focus-within:ring-2 focus-within:ring-zinc-400 dark:border-zinc-700">
        <span className="font-semibold text-zinc-400">RM</span>
        <input ref={inputRef} value={amount} onChange={(e) => { setAmount(e.target.value); setFlash(null); }}
          inputMode="decimal" placeholder="0.00" autoFocus
          className="w-full bg-transparent px-2 py-3 text-3xl font-bold tabular-nums outline-none" />
      </div>
      {amount && !sen && <p className="mt-1 text-sm text-red-600">Enter a valid amount, e.g. 12.50</p>}

      {hasExtra && (
        <>
          <label className="mt-3 block text-sm text-zinc-500">Extra money — optional (tips, incentives)</label>
          <div className="mt-1 flex items-center rounded-xl border border-zinc-300 px-4 focus-within:ring-2 focus-within:ring-zinc-400 dark:border-zinc-700">
            <span className="font-semibold text-zinc-400">+ RM</span>
            <input value={extra} onChange={(e) => { setExtra(e.target.value); setFlash(null); }}
              inputMode="decimal" placeholder="0.00"
              className="w-full bg-transparent px-2 py-2 text-xl font-semibold tabular-nums outline-none" />
          </div>
          {extraSen === null && <p className="mt-1 text-sm text-red-600">Enter a valid extra amount, or leave it empty</p>}
        </>
      )}

      <label className="mt-3 block text-sm text-zinc-500">Distance (km) — optional, used for RM/km</label>
      <div className="mt-1 flex items-center rounded-xl border border-zinc-300 px-4 dark:border-zinc-700">
        <input value={km} onChange={(e) => setKm(e.target.value)} inputMode="decimal" placeholder="e.g. 8.5"
          className="w-full bg-transparent py-2 text-lg tabular-nums outline-none" />
        <span className="text-sm text-zinc-400">km</span>
      </div>
      {kmTenths === null && <p className="mt-1 text-sm text-red-600">Invalid distance (max 1 decimal place)</p>}

      <div className="mt-4 space-y-1 rounded-xl bg-zinc-50 p-3 text-sm tabular-nums dark:bg-zinc-800/50">
        <Row label={hasExtra ? "Order fare" : "Amount"} value={b ? formatSen(b.grossSen) : "—"} />
        {hasExtra && b && b.extraSen > 0 && (
          <Row label="Extra" value={`+ ${formatSen(b.extraSen)}`} className="text-emerald-600" />
        )}
        {platform === "lalamove" && (
          <Row label={`Commission ${b?.ratePct ?? 21}%`} value={b ? `- ${formatSen(b.commissionSen)}` : "—"} className="text-red-600" />
        )}
        <div className="flex justify-between border-t border-zinc-200 pt-2 text-lg font-bold dark:border-zinc-700">
          <span>Net</span>
          <span className="text-emerald-600">{b ? formatSen(b.netSen) : "—"}</span>
        </div>
        {perKm !== null && <Row label="Net per km" value={`${formatSen(perKm)}/km`} className="font-semibold" />}
      </div>

      <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Note (optional) — e.g. location"
        className="mt-3 w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm dark:border-zinc-700" />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button type="button" disabled={!valid || pending} onClick={() => submit("rejected")}
          className="rounded-xl border-2 border-red-500 py-4 text-lg font-bold text-red-600 disabled:opacity-40">
          Reject
        </button>
        <button type="button" disabled={!valid || pending} onClick={() => submit("accepted")}
          className="rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white disabled:opacity-40">
          {pending ? "Saving…" : "Accept"}
        </button>
      </div>

      <LoadingOverlay show={pending} label={busyLabel} />

      {flash && (
        <p className={`mt-3 text-center text-sm font-medium ${flash.kind === "ok" ? "text-emerald-700" : "text-red-600"}`}>
          {flash.text}
        </p>
      )}
    </section>
  );
}

function Row({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex justify-between ${className}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
