import { describe, expect, it } from "vitest";

describe("InsightsCharts", () => {
  it("exports InsightsCharts component", async () => {
    const mod = await import("./insights-charts.tsx");
    expect(mod.InsightsCharts).toBeTypeOf("function");
  });
});
