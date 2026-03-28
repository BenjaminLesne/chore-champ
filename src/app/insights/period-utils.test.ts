import { describe, expect, it } from "vitest";
import {
  periodStartDate,
  periodCalendarDays,
  computeAvgAndStddev,
} from "./period-utils";

describe("periodStartDate", () => {
  it('returns null for "all"', () => {
    expect(periodStartDate("all")).toBeNull();
  });

  it("returns a date 30 days ago for 30d", () => {
    const result = periodStartDate("30d");
    expect(result).toBeInstanceOf(Date);
    const now = new Date();
    const expected = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 30,
    );
    expect(result?.getTime()).toBe(expected.getTime());
  });

  it("returns a date 3 months ago for 3m", () => {
    const result = periodStartDate("3m");
    expect(result).toBeInstanceOf(Date);
    const now = new Date();
    const expected = new Date(
      now.getFullYear(),
      now.getMonth() - 3,
      now.getDate(),
    );
    expect(result?.getTime()).toBe(expected.getTime());
  });

  it("returns a date 6 months ago for 6m", () => {
    const result = periodStartDate("6m");
    expect(result).toBeInstanceOf(Date);
    const now = new Date();
    const expected = new Date(
      now.getFullYear(),
      now.getMonth() - 6,
      now.getDate(),
    );
    expect(result?.getTime()).toBe(expected.getTime());
  });
});

describe("periodCalendarDays", () => {
  it("returns 31 for 30d period (30 days ago to today inclusive)", () => {
    expect(periodCalendarDays("30d")).toBe(31);
  });

  it("returns -1 for all period", () => {
    expect(periodCalendarDays("all")).toBe(-1);
  });

  it("returns a positive number for 3m", () => {
    const days = periodCalendarDays("3m");
    expect(days).toBeGreaterThan(80);
    expect(days).toBeLessThanOrEqual(93);
  });

  it("returns a positive number for 6m", () => {
    const days = periodCalendarDays("6m");
    expect(days).toBeGreaterThan(170);
    expect(days).toBeLessThanOrEqual(185);
  });
});

describe("computeAvgAndStddev", () => {
  it("computes correct avg and stddev with zero-chore days", () => {
    // 3 days with chores [2, 1, 3], 7 days without (10 calendar days)
    const result = computeAvgAndStddev([2, 1, 3], 10);
    expect(result.totalLogs).toBe(6);
    expect(result.avg).toBeCloseTo(0.6);
    // Manual: mean=0.6, diffs: (2-0.6)^2=1.96, (1-0.6)^2=0.16, (3-0.6)^2=5.76, 7*(0.6)^2=2.52
    // variance = (1.96+0.16+5.76+2.52)/10 = 1.04
    // stddev = sqrt(1.04) ≈ 1.0198
    expect(result.stddev).toBeCloseTo(1.0198, 3);
  });

  it("returns zero stddev when all days have same count", () => {
    const result = computeAvgAndStddev([3, 3, 3], 3);
    expect(result.avg).toBe(3);
    expect(result.stddev).toBe(0);
  });

  it("handles empty daily counts", () => {
    const result = computeAvgAndStddev([], 10);
    expect(result.totalLogs).toBe(0);
    expect(result.avg).toBe(0);
    expect(result.stddev).toBe(0);
  });

  it("handles single day with chores", () => {
    const result = computeAvgAndStddev([5], 5);
    expect(result.totalLogs).toBe(5);
    expect(result.avg).toBe(1);
    // 1 day with 5, 4 days with 0: mean=1
    // variance = ((5-1)^2 + 4*(0-1)^2)/5 = (16+4)/5 = 4
    expect(result.stddev).toBe(2);
  });
});
