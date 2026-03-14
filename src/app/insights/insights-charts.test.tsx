import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { InsightsCharts } from "./insights-charts.tsx";

describe("InsightsCharts", () => {
  it("shows message when no members", async () => {
    const screen = await render(
      <InsightsCharts members={[]} weeklyData={[]} monthlyData={[]} />,
    );
    await expect
      .element(screen.getByText("Add members in Settings to see insights."))
      .toBeVisible();
  });

  it("shows message when no chore data", async () => {
    const screen = await render(
      <InsightsCharts
        members={[{ id: 1, name: "Alice" }]}
        weeklyData={[]}
        monthlyData={[]}
      />,
    );
    await expect
      .element(
        screen.getByText("No chore data yet. Log some chores to see trends!"),
      )
      .toBeVisible();
  });

  it("renders weekly/monthly toggle when data exists", async () => {
    const monthlyData = [
      {
        year: 2026,
        month: 1,
        memberId: 1,
        totalPoints: 10,
        choreCount: 5,
      },
    ];
    const screen = await render(
      <InsightsCharts
        members={[{ id: 1, name: "Alice" }]}
        weeklyData={[]}
        monthlyData={monthlyData}
      />,
    );
    await expect.element(screen.getByText("Weekly")).toBeVisible();
    await expect.element(screen.getByText("Monthly")).toBeVisible();
  });
});
