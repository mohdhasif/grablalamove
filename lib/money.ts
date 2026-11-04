// All money math is done in SEN (integer cents) to avoid floating point errors.
// This logic must match the generated columns in supabase/migrations/0001_init.sql.

export type Platform = "grab" | "lalamove";
export type OrderStatus = "accepted" | "rejected";

/** Commission rate in basis points (2100 = 21%). Change it here if the rate changes. */
export const COMMISSION_BPS: Record<Platform, number> = {
  grab: 0,
  lalamove: 2100,
};

export const PLATFORM_LABEL: Record<Platform, string> = {
  grab: "Grab",
  lalamove: "Lalamove",
};

/** "12.5" / "12,50" / "RM 12.50" -> 1250 sen. Returns null if invalid. */
export function parseToSen(input: string): number | null {
  const cleaned = input.replace(/rm/i, "").replace(/\s/g, "").replace(",", ".");
  if (!/^\d{1,5}(\.\d{0,2})?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const sen = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  return sen > 0 ? sen : null;
}

export function calcBreakdown(grossSen: number, platform: Platform) {
  const bps = COMMISSION_BPS[platform];
  // Round half up (same as Postgres round() for positive numbers)
  const commissionSen = Math.round((grossSen * bps) / 10000);
  return {
    grossSen,
    commissionSen,
    netSen: grossSen - commissionSen,
    ratePct: bps / 100,
  };
}

const fmt = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" });

export function formatSen(sen: number): string {
  return fmt.format(sen / 100);
}

/** Postgres numeric value (string "12.34" or number) -> sen */
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
  fuel: "⛽ Fuel",
  toll: "🛣️ Toll",
  parking: "🅿️ Parking",
  maintenance: "🔧 Service",
  other: "📦 Other",
};

/** "12.5" / "12,5" -> 125 (in 0.1 km units). Empty -> undefined, invalid -> null. */
export function parseKmTenths(input: string): number | null | undefined {
  const cleaned = input.replace(/km/i, "").replace(/\s/g, "").replace(",", ".");
  if (cleaned === "") return undefined;
  if (!/^\d{1,3}(\.\d?)?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const tenths = Number(whole) * 10 + Number(frac || "0");
  return tenths > 0 ? tenths : null;
}

/** RM per km in sen (rounded), or null when there is no distance. */
export function senPerKm(netSen: number, kmTenths: number): number | null {
  return kmTenths > 0 ? Math.round((netSen * 10) / kmTenths) : null;
}
