"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { COMMISSION_BPS, bpsToRate, parseToSen, senToDb, type OrderStatus, type Platform } from "@/lib/money";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function recordOrder(input: {
  platform: Platform;
  amount: string;
  status: OrderStatus;
  note?: string;
}): Promise<ActionResult> {
  if (!(input.platform in COMMISSION_BPS)) return { ok: false, error: "Platform tidak sah" };
  if (input.status !== "accepted" && input.status !== "rejected") return { ok: false, error: "Status tidak sah" };
  const sen = parseToSen(input.amount);
  if (sen === null) return { ok: false, error: "Amaun tidak sah" };

  const supabase = await createClient();
  // Kadar diambil dari server, bukan dari client — elak manipulasi.
  const { error } = await supabase.from("orders").insert({
    platform: input.platform,
    gross_amount: senToDb(sen),
    commission_rate: bpsToRate(COMMISSION_BPS[input.platform]),
    status: input.status,
    note: input.note?.trim().slice(0, 200) || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/history");
  return { ok: true };
}

export async function deleteOrder(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/history");
  return { ok: true };
}
