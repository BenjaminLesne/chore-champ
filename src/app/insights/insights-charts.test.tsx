import { describe, it } from "node:test";
import * as assert from "node:assert";

void describe("InsightsCharts", () => {
  void it("exports InsightsCharts component", async () => {
    const mod = await import("./insights-charts.tsx");
    assert.ok(typeof mod.InsightsCharts === "function");
  });
});
