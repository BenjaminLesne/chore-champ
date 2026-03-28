import type { Period } from "./period-selector";

/**
 * Returns the start date for a given period, or null for "all time".
 */
export function periodStartDate(period: Period): Date | null {
  if (period === "all") return null;
  const now = new Date();
  switch (period) {
    case "30d":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    case "3m":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "6m":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  }
}

/**
 * Returns the number of calendar days in the period (from start to today inclusive).
 */
export function periodCalendarDays(period: Period): number {
  const start = periodStartDate(period);
  if (!start) return -1; // "all" handled separately per-member
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  return Math.floor((today.getTime() - startDay.getTime()) / 86_400_000) + 1;
}

/**
 * Compute average and standard deviation from an array of daily counts
 * over a given number of calendar days (zero-chore days count as 0).
 */
export function computeAvgAndStddev(
  dailyCounts: number[],
  calendarDays: number,
) {
  const totalLogs = dailyCounts.reduce((sum, c) => sum + c, 0);
  const avg = totalLogs / calendarDays;

  const zeroDays = calendarDays - dailyCounts.length;
  let sumSquaredDiffs = 0;
  for (const c of dailyCounts) {
    sumSquaredDiffs += (c - avg) ** 2;
  }
  sumSquaredDiffs += zeroDays * avg ** 2;
  const stddev = Math.sqrt(sumSquaredDiffs / calendarDays);

  return { totalLogs, avg, stddev };
}
