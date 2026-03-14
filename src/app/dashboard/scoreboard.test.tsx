import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Scoreboard } from "./scoreboard.tsx";

describe("Scoreboard", () => {
  it("renders nothing when scores are empty", async () => {
    const screen = await render(<Scoreboard scores={[]} />);
    expect(screen.container.innerHTML).toBe("");
  });

  it("renders member names and points", async () => {
    const scores = [
      { memberId: 1, memberName: "Alice", totalPoints: 15 },
      { memberId: 2, memberName: "Bob", totalPoints: 10 },
    ];
    const screen = await render(<Scoreboard scores={scores} />);
    await expect.element(screen.getByText("Alice").first()).toBeVisible();
    await expect.element(screen.getByText("Bob").first()).toBeVisible();
    await expect.element(screen.getByText("15").first()).toBeVisible();
    await expect.element(screen.getByText("10").first()).toBeVisible();
  });

  it("shows 'Leader' when one person is winning", async () => {
    const scores = [
      { memberId: 1, memberName: "Alice", totalPoints: 20 },
      { memberId: 2, memberName: "Bob", totalPoints: 5 },
    ];
    const screen = await render(<Scoreboard scores={scores} />);
    await expect.element(screen.getByText("Leader")).toBeVisible();
  });

  it("shows 'Co-Winners' when tied", async () => {
    const scores = [
      { memberId: 1, memberName: "Alice", totalPoints: 10 },
      { memberId: 2, memberName: "Bob", totalPoints: 10 },
    ];
    const screen = await render(<Scoreboard scores={scores} />);
    await expect.element(screen.getByText("Co-Winners")).toBeVisible();
  });

  it("shows 'no chores logged' when all points are zero", async () => {
    const scores = [
      { memberId: 1, memberName: "Alice", totalPoints: 0 },
      { memberId: 2, memberName: "Bob", totalPoints: 0 },
    ];
    const screen = await render(<Scoreboard scores={scores} />);
    await expect
      .element(screen.getByText("No chores logged this month yet"))
      .toBeVisible();
  });

  it("contains 'Scoreboard' in the heading", async () => {
    const scores = [{ memberId: 1, memberName: "Alice", totalPoints: 5 }];
    const screen = await render(<Scoreboard scores={scores} />);
    await expect.element(screen.getByText(/Scoreboard/)).toBeVisible();
  });
});
