// Semua kiraan wang dibuat dalam SEN (integer) untuk elak ralat floating point.
// Logik ini mesti sama dengan generated column dalam supabase/migrations/0001_init.sql.

export type Platform = "grab" | "lalamove";
export type OrderStatus = "accepted" | "rejected";

/** Kadar potongan dalam basis points (2100 = 21%). Tukar di sini jika kadar berubah. */
export const COMMISSION_BPS: Record<Platform, number> = {
  grab: 0,
  lalamove: 2100,
};

export const PLATFORM_LABEL: Record<Platform, string> = {
  grab: "Grab",
  lalamove: "Lalamove",
};

/** "12.5" / "12,50" / "RM 12.50" -> 1250 sen. Pulangkan null jika tidak sah. */
export function parseToSen(input: string): number | null {
  const cleaned = input.replace(/rm/i, "").replace(/\s/g, "").replace(",", ".");
  if (!/^\d{1,5}(\.\d{0,2})?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const sen = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  return sen > 0 ? sen : null;
}

export function calcBreakdown(grossSen: number, platform: Platform) {
  const bps = COMMISSION_BPS[platform];
  // Bundar separuh ke atas (sama seperti round() Postgres untuk nombor positif)
  const commissionSen = Math.round((grossSen * bps) / 10000);
  return {
    grossSen,
    commissionSen,
    netSen: grossSen - commissionSen,
    ratePct: bps / 100,
  };
}

const fmt = new Intl.NumberFormat("ms-MY", { style: "currency", currency: "MYR" });

export function formatSen(sen: number): string {
  return fmt.format(sen / 100);
}

/** Nilai numeric dari Postgres (string "12.34" atau number) -> sen */
export function dbToSen(v: string | number): number {
  return Math.round(Number(v) * 100);
}

export function senToDb(sen: number): string {
  return (sen / 100).toFixed(2);
}

export function bpsToRate(bps: number): string {
  return (bps / 10000).toFixed(4);
}

export type ExpenseCategory = "fuel" | "toll" | "parking" | "maintenance" | "other";

export const EXPENSE_LABEL: Record<ExpenseCategory, string> = {
  fuel: "⛽ Minyak",
  toll: "🛣️ Tol",
  parking: "🅿️ Parking",
  maintenance: "🔧 Servis",
  other: "📦 Lain-lain",
};

/** "12.5" / "12,5" -> 125 (dalam 0.1 km). Kosong -> undefined, tidak sah -> null. */
export function parseKmTenths(input: string): number | null | undefined {
  const cleaned = input.replace(/km/i, "").replace(/\s/g, "").replace(",", ".");
  if (cleaned === "") return undefined;
  if (!/^\d{1,3}(\.\d?)?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const tenths = Number(whole) * 10 + Number(frac || "0");
  return tenths > 0 ? tenths : null;
}

/** RM per km dalam sen (dibundarkan), atau null jika tiada jarak. */
export function senPerKm(netSen: number, kmTenths: number): number | null {
  return kmTenths > 0 ? Math.round((netSen * 10) / kmTenths) : null;
}
