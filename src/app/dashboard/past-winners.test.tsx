import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { PastWinners } from "./past-winners.tsx";

describe("PastWinners", () => {
  it("renders nothing when there are no monthly data", async () => {
    const screen = await render(<PastWinners monthlyData={[]} />);
    expect(screen.container.innerHTML).toBe("");
  });

  it("renders nothing when all points are zero", async () => {
    const screen = await render(
      <PastWinners
        monthlyData={[
          { year: 2026, month: 1, memberName: "Alice", totalPoints: 0 },
        ]}
      />,
    );
    expect(screen.container.innerHTML).toBe("");
  });

  it("renders the 'Past Winners' heading", async () => {
    const screen = await render(
      <PastWinners
        monthlyData={[
          { year: 2026, month: 1, memberName: "Alice", totalPoints: 10 },
        ]}
      />,
    );
    await expect.element(screen.getByText("Past Winners")).toBeVisible();
  });

  it("displays the winner name and points", async () => {
    const screen = await render(
      <PastWinners
        monthlyData={[
          { year: 2026, month: 2, memberName: "Bob", totalPoints: 25 },
          { year: 2026, month: 2, memberName: "Alice", totalPoints: 10 },
        ]}
      />,
    );
    await expect.element(screen.getByText("Bob")).toBeVisible();
    await expect.element(screen.getByText("25")).toBeVisible();
  });

  it("displays co-winners joined by &", async () => {
    const screen = await render(
      <PastWinners
        monthlyData={[
          { year: 2026, month: 3, memberName: "Alice", totalPoints: 15 },
          { year: 2026, month: 3, memberName: "Bob", totalPoints: 15 },
        ]}
      />,
    );
    await expect.element(screen.getByText("Alice & Bob")).toBeVisible();
  });
});
