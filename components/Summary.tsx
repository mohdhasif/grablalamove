import { formatSen } from "@/lib/money";
import type { summarize } from "@/lib/orders";

export function Summary({ s, title }: { s: ReturnType<typeof summarize>; title: string }) {
  return (
    <section className="rounded-2xl bg-zinc-900 p-4 text-white dark:bg-zinc-100 dark:text-zinc-900">
      <p className="text-sm opacity-70">{title} · untung (selepas kos)</p>
      <p className={`text-4xl font-bold tabular-nums ${s.profitSen < 0 ? "text-red-400 dark:text-red-600" : ""}`}>
        {formatSen(s.profitSen)}
      </p>
      <p className="mt-1 text-xs opacity-70 tabular-nums">
        Pendapatan bersih {formatSen(s.netSen)} − kos {formatSen(s.expenseSen)}
        {s.commissionSen > 0 && ` · potongan Lalamove ${formatSen(s.commissionSen)}`}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <Stat label="Grab" value={formatSen(s.grab.netSen)} sub={`${s.grab.count} order`} />
        <Stat label="Lalamove" value={formatSen(s.lalamove.netSen)} sub={`${s.lalamove.count} order`} />
        <Stat label="RM/km" value={s.senPerKm === null ? "—" : formatSen(s.senPerKm)}
          sub={s.kmTenths ? `${(s.kmTenths / 10).toFixed(1)} km direkod` : "isi jarak order"} />
        <Stat label="Accept rate" value={s.acceptRate === null ? "—" : `${s.acceptRate}%`} sub={`${s.rejectedCount} reject`} />
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-2 dark:bg-black/5">
      <p className="text-xs opacity-70">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
      <p className="text-xs opacity-60">{sub}</p>
    </div>
  );
}
