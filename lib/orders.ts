import { createClient } from "@/lib/supabase/server";
import { dbToSen, senPerKm, type ExpenseCategory, type OrderStatus, type Platform } from "@/lib/money";
import { rangeStart, type Range } from "@/lib/time";

export type Order = {
  id: string;
  platform: Platform;
  grossSen: number;
  commissionSen: number;
  extraSen: number;
  netSen: number;
  ratePct: number;
  /** distance in 0.1 km units, null when not entered */
  kmTenths: number | null;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
};

export type Expense = {
  id: string;
  category: ExpenseCategory;
  amountSen: number;
  note: string | null;
  spentAt: string;
};

export async function listOrders(range: Range, platform?: Platform, limit = 500): Promise<Order[]> {
  const supabase = await createClient();
  let q = supabase
    .from("orders")
    .select("id, platform, gross_amount, commission_amount, extra_amount, net_amount, commission_rate, distance_km, status, note, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  const start = rangeStart(range);
  if (start) q = q.gte("created_at", start);
  if (platform) q = q.eq("platform", platform);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    platform: r.platform,
    grossSen: dbToSen(r.gross_amount),
    commissionSen: dbToSen(r.commission_amount),
    extraSen: dbToSen(r.extra_amount),
    netSen: dbToSen(r.net_amount),
    ratePct: Number(r.commission_rate) * 100,
    kmTenths: r.distance_km === null ? null : Math.round(Number(r.distance_km) * 10),
    status: r.status,
    note: r.note,
    createdAt: r.created_at,
  }));
}

export async function listExpenses(range: Range, limit = 500): Promise<Expense[]> {
  const supabase = await createClient();
  let q = supabase
    .from("expenses")
    .select("id, category, amount, note, spent_at")
    .order("spent_at", { ascending: false })
    .limit(limit);
  const start = rangeStart(range);
  if (start) q = q.gte("spent_at", start);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    category: r.category,
    amountSen: dbToSen(r.amount),
    note: r.note,
    spentAt: r.spent_at,
  }));
}

export function summarize(orders: Order[], expenses: Expense[] = []) {
  const accepted = orders.filter((o) => o.status === "accepted");
  const rejected = orders.filter((o) => o.status === "rejected");
  const sum = (xs: Order[], k: "grossSen" | "netSen" | "commissionSen" | "extraSen") => xs.reduce((a, o) => a + o[k], 0);
  const byPlatform = (p: Platform) => {
    const xs = accepted.filter((o) => o.platform === p);
    return { count: xs.length, netSen: sum(xs, "netSen") };
  };
  // RM/km only uses orders with a distance, so orders without km do not skew it.
  const withKm = accepted.filter((o) => o.kmTenths);
  const kmTenths = withKm.reduce((a, o) => a + (o.kmTenths ?? 0), 0);
  const netSen = sum(accepted, "netSen");
  const expenseSen = expenses.reduce((a, e) => a + e.amountSen, 0);
  return {
    netSen,
    grossSen: sum(accepted, "grossSen"),
    commissionSen: sum(accepted, "commissionSen"),
    extraSen: sum(accepted, "extraSen"),
    expenseSen,
    profitSen: netSen - expenseSen,
    kmTenths,
    senPerKm: senPerKm(sum(withKm, "netSen"), kmTenths),
    acceptedCount: accepted.length,
    rejectedCount: rejected.length,
    acceptRate: orders.length ? Math.round((accepted.length / orders.length) * 100) : null,
    grab: byPlatform("grab"),
    lalamove: byPlatform("lalamove"),
  };
}
