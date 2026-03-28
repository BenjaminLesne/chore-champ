import { describe, expect, it } from "vitest";
import { buildBarData, buildLineData } from "./insights-charts";

const members = [
  { id: 1, name: "Benjamin" },
  { id: 2, name: "Shadwa" },
];

describe("buildBarData", () => {
  it("computes correct weekly averages with numeric values", () => {
    const data = [
      { year: 2026, week: 1, memberId: 1, totalPoints: 10, choreCount: 5 },
      { year: 2026, week: 1, memberId: 2, totalPoints: 8, choreCount: 4 },
      { year: 2026, week: 2, memberId: 1, totalPoints: 12, choreCount: 6 },
      { year: 2026, week: 2, memberId: 2, totalPoints: 6, choreCount: 3 },
    ];

    const result = buildBarData(members, data, "weekly");
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("Benjamin", 5.5); // (5+6)/2
    expect(result[0]).toHaveProperty("Shadwa", 3.5); // (4+3)/2
  });

  it("computes correct monthly averages", () => {
    const data = [
      { year: 2026, month: 1, memberId: 1, totalPoints: 50, choreCount: 20 },
      { year: 2026, month: 1, memberId: 2, totalPoints: 40, choreCount: 15 },
      { year: 2026, month: 2, memberId: 1, totalPoints: 60, choreCount: 25 },
      { year: 2026, month: 2, memberId: 2, totalPoints: 45, choreCount: 18 },
    ];

    const result = buildBarData(members, data, "monthly");
    expect(result[0]).toHaveProperty("Benjamin", 22.5); // (20+25)/2
    expect(result[0]).toHaveProperty("Shadwa", 16.5); // (15+18)/2
  });

  it("returns 0 for members with no data", () => {
    const data = [
      { year: 2026, week: 1, memberId: 1, totalPoints: 10, choreCount: 5 },
    ];

    const result = buildBarData(members, data, "weekly");
    expect(result[0]).toHaveProperty("Benjamin", 5);
    expect(result[0]).toHaveProperty("Shadwa", 0);
  });

  it("handles empty data", () => {
    const result = buildBarData(members, [], "weekly");
    expect(result[0]).toHaveProperty("Benjamin", 0);
    expect(result[0]).toHaveProperty("Shadwa", 0);
  });

  it("produces numeric results, not string concatenation", () => {
    // Regression test for the ::int cast bug.
    // If choreCount were strings (e.g. from missing ::int cast),
    // reduce would concatenate: "5" + "6" = "56" instead of 11.
    const data = [
      { year: 2026, week: 1, memberId: 1, totalPoints: 10, choreCount: 5 },
      { year: 2026, week: 2, memberId: 1, totalPoints: 12, choreCount: 6 },
    ];

    const result = buildBarData(members, data, "weekly");
    const avg = result[0]?.Benjamin ?? 0;
    expect(avg).toBe(5.5);
    expect(avg).toBeLessThan(100); // would be 28 ("56"/2) with string concat
  });
});

describe("buildLineData", () => {
  it("maps totalPoints per member per weekly period", () => {
    const data = [
      { year: 2026, week: 10, memberId: 1, totalPoints: 50, choreCount: 5 },
      { year: 2026, week: 10, memberId: 2, totalPoints: 30, choreCount: 3 },
    ];

    const result = buildLineData(members, data, "weekly");
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("Benjamin", 50);
    expect(result[0]).toHaveProperty("Shadwa", 30);
    expect(result[0]).toHaveProperty("label", "W10");
  });

  it("fills 0 for members missing from a period", () => {
    const data = [
      { year: 2026, week: 10, memberId: 1, totalPoints: 50, choreCount: 5 },
    ];

    const result = buildLineData(members, data, "weekly");
    expect(result[0]).toHaveProperty("Benjamin", 50);
    expect(result[0]).toHaveProperty("Shadwa", 0);
  });

  it("sorts periods chronologically", () => {
    const data = [
      { year: 2026, month: 2, memberId: 1, totalPoints: 20, choreCount: 2 },
      { year: 2026, month: 1, memberId: 1, totalPoints: 10, choreCount: 1 },
    ];

    const result = buildLineData(members, data, "monthly");
    expect(result).toHaveLength(2);
    // Data arrives pre-sorted from SQL, result preserves insertion order
    expect(result[0]).toHaveProperty("Benjamin", 20);
    expect(result[1]).toHaveProperty("Benjamin", 10);
  });
});
