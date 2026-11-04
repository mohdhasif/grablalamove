import Link from "next/link";
import { ExpenseList } from "@/components/ExpenseList";
import { Nav } from "@/components/Nav";
import { OrderList } from "@/components/OrderList";
import { Summary } from "@/components/Summary";
import { PLATFORM_LABEL, type Platform } from "@/lib/money";
import { listExpenses, listOrders, summarize } from "@/lib/orders";
import { RANGE_LABEL, type Range } from "@/lib/time";

export default async function History({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; platform?: string }>;
}) {
  const sp = await searchParams;
  const range: Range = sp.range && sp.range in RANGE_LABEL ? (sp.range as Range) : "week";
  const platform = sp.platform && sp.platform in PLATFORM_LABEL ? (sp.platform as Platform) : undefined;
  // Kos tidak terikat pada platform, jadi hanya dikira bila "Semua platform".
  const [orders, expenses] = await Promise.all([
    listOrders(range, platform),
    platform ? Promise.resolve([]) : listExpenses(range),
  ]);

  const href = (r: Range, p?: Platform) => `/history?range=${r}${p ? `&platform=${p}` : ""}`;
  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-sm ${active ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-200 dark:bg-zinc-800"}`;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4 pb-10">
      <Nav />
      <div className="flex flex-wrap gap-2">
        {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
          <Link key={r} href={href(r, platform)} className={chip(r === range)}>{RANGE_LABEL[r]}</Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={href(range)} className={chip(!platform)}>Semua platform</Link>
        {(Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => (
          <Link key={p} href={href(range, p)} className={chip(p === platform)}>{PLATFORM_LABEL[p]}</Link>
        ))}
      </div>
      <Summary s={summarize(orders, expenses)} title={RANGE_LABEL[range]} />
      <section>
        <h2 className="mb-1 text-sm font-semibold text-zinc-500">Order</h2>
        <OrderList orders={orders} />
      </section>
      {!platform && (
        <section>
          <h2 className="mb-1 text-sm font-semibold text-zinc-500">Kos</h2>
          <ExpenseList expenses={expenses} />
        </section>
      )}
    </main>
  );
}
