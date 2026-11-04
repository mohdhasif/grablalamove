// Malaysia is UTC+8 all year (no DST), so day boundaries are simple to compute.
const MYT_OFFSET_MS = 8 * 60 * 60 * 1000;

export type Range = "today" | "week" | "month" | "all";

export const RANGE_LABEL: Record<Range, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  all: "All time",
};

/** Start of the range (Malaysia time) as a UTC ISO string, or null for "all". */
export function rangeStart(range: Range, now = new Date()): string | null {
  if (range === "all") return null;
  const myt = new Date(now.getTime() + MYT_OFFSET_MS); // UTC fields now read as MY time
  let y = myt.getUTCFullYear(), m = myt.getUTCMonth(), d = myt.getUTCDate();
  if (range === "week") d -= (myt.getUTCDay() + 6) % 7; // weeks start on Monday
  if (range === "month") d = 1;
  return new Date(Date.UTC(y, m, d) - MYT_OFFSET_MS).toISOString();
}

const timeFmt = new Intl.DateTimeFormat("en-MY", {
  timeZone: "Asia/Kuala_Lumpur", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false,
});
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));
