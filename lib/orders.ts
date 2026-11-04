import { createClient } from "@/lib/supabase/server";
import { dbToSen, type OrderStatus, type Platform } from "@/lib/money";
import { rangeStart, type Range } from "@/lib/time";

export type Order = {
  id: string;
  platform: Platform;
  grossSen: number;
  commissionSen: number;
  netSen: number;
  ratePct: number;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
};

export async function listOrders(range: Range, platform?: Platform, limit = 500): Promise<Order[]> {
  const supabase = await createClient();
  let q = supabase
    .from("orders")
    .select("id, platform, gross_amount, commission_amount, net_amount, commission_rate, status, note, created_at")
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
    netSen: dbToSen(r.net_amount),
    ratePct: Number(r.commission_rate) * 100,
    status: r.status,
    note: r.note,
    createdAt: r.created_at,
  }));
}

export function summarize(orders: Order[]) {
  const accepted = orders.filter((o) => o.status === "accepted");
  const rejected = orders.filter((o) => o.status === "rejected");
  const sum = (xs: Order[], k: "grossSen" | "netSen" | "commissionSen") => xs.reduce((a, o) => a + o[k], 0);
  const byPlatform = (p: Platform) => {
    const xs = accepted.filter((o) => o.platform === p);
    return { count: xs.length, netSen: sum(xs, "netSen") };
  };
  return {
    netSen: sum(accepted, "netSen"),
    grossSen: sum(accepted, "grossSen"),
    commissionSen: sum(accepted, "commissionSen"),
    acceptedCount: accepted.length,
    rejectedCount: rejected.length,
    rejectedNetSen: sum(rejected, "netSen"),
    acceptRate: orders.length ? Math.round((accepted.length / orders.length) * 100) : null,
    grab: byPlatform("grab"),
    lalamove: byPlatform("lalamove"),
  };
}
