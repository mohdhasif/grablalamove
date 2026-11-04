"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  COMMISSION_BPS, EXPENSE_LABEL, bpsToRate, parseKmTenths, parseToSen, senToDb,
  type ExpenseCategory, type OrderStatus, type Platform,
} from "@/lib/money";

export type ActionResult = { ok: true } | { ok: false; error: string };

function refresh() {
  revalidatePath("/");
  revalidatePath("/history");
}

const cleanNote = (note?: string) => note?.trim().slice(0, 200) || null;

export async function recordOrder(input: {
  platform: Platform;
  amount: string;
  status: OrderStatus;
  distanceKm?: string;
  note?: string;
}): Promise<ActionResult> {
  if (!(input.platform in COMMISSION_BPS)) return { ok: false, error: "Platform tidak sah" };
  if (input.status !== "accepted" && input.status !== "rejected") return { ok: false, error: "Status tidak sah" };
  const sen = parseToSen(input.amount);
  if (sen === null) return { ok: false, error: "Amaun tidak sah" };
  const km = parseKmTenths(input.distanceKm ?? "");
  if (km === null) return { ok: false, error: "Jarak tidak sah" };

  const supabase = await createClient();
  // Kadar diambil dari server, bukan dari client — elak manipulasi.
  const { error } = await supabase.from("orders").insert({
    platform: input.platform,
    gross_amount: senToDb(sen),
    commission_rate: bpsToRate(COMMISSION_BPS[input.platform]),
    distance_km: km === undefined ? null : (km / 10).toFixed(1),
    status: input.status,
    note: cleanNote(input.note),
  });
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function deleteOrder(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function recordExpense(input: {
  category: ExpenseCategory;
  amount: string;
  note?: string;
}): Promise<ActionResult> {
  if (!(input.category in EXPENSE_LABEL)) return { ok: false, error: "Kategori tidak sah" };
  const sen = parseToSen(input.amount);
  if (sen === null) return { ok: false, error: "Amaun tidak sah" };
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert({
    category: input.category,
    amount: senToDb(sen),
    note: cleanNote(input.note),
  });
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}
