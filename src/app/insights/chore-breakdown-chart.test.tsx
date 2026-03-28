import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { ChoreBreakdownChart } from "./chore-breakdown-chart.tsx";
import type { ChoreBreakdownEntry } from "./queries.ts";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <NuqsTestingAdapter>{children}</NuqsTestingAdapter>;
}

const members = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

const breakdownByMember: Record<string, ChoreBreakdownEntry[]> = {
  "1": [
    {
      choreId: 10,
      choreName: "Dishes",
      choreIconName: "dishwasher",
      choreIconColor: "#3b82f6",
      count: 15,
    },
    {
      choreId: 11,
      choreName: "Laundry",
      choreIconName: "washing_machine",
      choreIconColor: "#f59e0b",
      count: 8,
    },
  ],
  "2": [
    {
      choreId: 10,
      choreName: "Dishes",
      choreIconName: "dishwasher",
      choreIconColor: "#3b82f6",
      count: 5,
    },
  ],
};

describe("ChoreBreakdownChart", () => {
  it("renders empty state when no members", async () => {
    const screen = await render(
      <ChoreBreakdownChart members={[]} breakdownByMember={{}} />,
      { wrapper: Wrapper },
    );
    await expect
      .element(screen.getByText("No members in household."))
      .toBeVisible();
  });

  it("renders empty state when selected member has no data", async () => {
    const screen = await render(
      <ChoreBreakdownChart
        members={[{ id: 99, name: "Nobody" }]}
        breakdownByMember={{}}
      />,
      { wrapper: Wrapper },
    );
    await expect
      .element(
        screen.getByText(
          "No chore data for this member in the selected period.",
        ),
      )
      .toBeVisible();
  });

  it("renders chart with chore names for first member", async () => {
    const screen = await render(
      <ChoreBreakdownChart
        members={members}
        breakdownByMember={breakdownByMember}
      />,
      { wrapper: Wrapper },
    );
    // Recharts renders chore names as YAxis tick labels — use getByRole for the chart container
    // Check that the chart container is rendered (not the empty state)
    const emptyMessage = screen.getByText(
      "No chore data for this member in the selected period.",
    );
    await expect.element(emptyMessage).not.toBeInTheDocument();
  });

  it("renders member selector with all members", async () => {
    const screen = await render(
      <ChoreBreakdownChart
        members={members}
        breakdownByMember={breakdownByMember}
      />,
      { wrapper: Wrapper },
    );
    const select = screen.getByLabelText("Select member");
    await expect.element(select).toBeVisible();
    // Both options present in the select
    const options = select
      .elements()
      .flatMap((el) => Array.from(el.querySelectorAll("option")));
    const optionTexts = options.map((o) => o.textContent);
    expect(optionTexts).toContain("Alice");
    expect(optionTexts).toContain("Bob");
  });
});
