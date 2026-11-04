"use client";

import { useTransition } from "react";
import { deleteOrder } from "@/app/actions";
import { PLATFORM_LABEL, formatSen, senPerKm } from "@/lib/money";
import type { Order } from "@/lib/orders";
import { formatTime } from "@/lib/time";
import { LoadingOverlay } from "./LoadingOverlay";

export function OrderList({ orders }: { orders: Order[] }) {
  const [pending, startTransition] = useTransition();

  if (!orders.length) return <p className="py-6 text-center text-sm text-zinc-500">No orders yet.</p>;

  return (
    <>
    <LoadingOverlay show={pending} label="Deleting order…" />
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {orders.map((o) => (
        <li key={o.id} className={`flex items-center gap-3 py-3 ${o.status === "rejected" ? "opacity-50" : ""}`}>
          <span className={`w-20 shrink-0 rounded-md px-2 py-1 text-center text-xs font-bold text-white ${o.platform === "grab" ? "bg-emerald-600" : "bg-orange-500"}`}>
            {PLATFORM_LABEL[o.platform]}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold tabular-nums">
              {formatSen(o.netSen)}
              {o.status === "rejected" && <span className="ml-2 text-xs font-medium text-red-600">REJECT</span>}
            </div>
            <div className="truncate text-xs text-zinc-500">
              {formatTime(o.createdAt)}
              {o.kmTenths && ` · ${(o.kmTenths / 10).toFixed(1)} km (${formatSen(senPerKm(o.netSen, o.kmTenths)!)}/km)`}
              {o.commissionSen > 0 && ` · gross ${formatSen(o.grossSen)} − ${o.ratePct}%`}
              {o.note && ` · ${o.note}`}
            </div>
          </div>
          <button type="button" disabled={pending} aria-label="Delete"
            onClick={() => confirm("Delete this record?") && startTransition(async () => { await deleteOrder(o.id); })}
            className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800">
            ✕
          </button>
        </li>
      ))}
    </ul>
    </>
  );
}
