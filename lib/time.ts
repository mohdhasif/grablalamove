// Malaysia = UTC+8 sepanjang tahun (tiada DST), jadi kiraan sempadan hari mudah.
const MYT_OFFSET_MS = 8 * 60 * 60 * 1000;

export type Range = "today" | "week" | "month" | "all";

export const RANGE_LABEL: Record<Range, string> = {
  today: "Hari ini",
  week: "Minggu ini",
  month: "Bulan ini",
  all: "Semua",
};

/** Mula julat (dalam waktu Malaysia) sebagai ISO UTC, atau null untuk "all". */
export function rangeStart(range: Range, now = new Date()): string | null {
  if (range === "all") return null;
  const myt = new Date(now.getTime() + MYT_OFFSET_MS); // baca medan UTC = waktu MY
  let y = myt.getUTCFullYear(), m = myt.getUTCMonth(), d = myt.getUTCDate();
  if (range === "week") d -= (myt.getUTCDay() + 6) % 7; // minggu bermula Isnin
  if (range === "month") d = 1;
  return new Date(Date.UTC(y, m, d) - MYT_OFFSET_MS).toISOString();
}

const timeFmt = new Intl.DateTimeFormat("ms-MY", {
  timeZone: "Asia/Kuala_Lumpur", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false,
});
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));
