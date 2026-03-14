import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

vi.mock("@/server/chore-logs/actions", () => ({
  logChore: vi.fn(),
  undoChoreLog: vi.fn(),
}));

vi.mock("nuqs", () => ({
  useQueryState: () => [null, vi.fn()],
  parseAsInteger: {},
}));

const { ChoreBoard } = await import("./chore-board.tsx");

const members = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

const chores = [
  {
    id: 1,
    name: "Dishes",
    iconName: "dishwasher",
    iconStyle: "empty",
    points: 5,
  },
  {
    id: 2,
    name: "Laundry",
    iconName: "washing_machine",
    iconStyle: "fill",
    points: 3,
  },
];

const monthlyScores = [
  { memberId: 1, memberName: "Alice", totalPoints: 45 },
  { memberId: 2, memberName: "Bob", totalPoints: 32 },
];

describe("ChoreBoard", () => {
  it("shows empty state when no chores", async () => {
    const screen = await render(
      <ChoreBoard
        chores={[]}
        members={members}
        recentLogs={[]}
        monthlyScores={monthlyScores}
      />,
    );
    await expect.element(screen.getByText(/No chores yet/)).toBeVisible();
    await expect.element(screen.getByText("Settings")).toBeVisible();
  });

  it("renders member columns with names and points", async () => {
    const screen = await render(
      <ChoreBoard
        chores={chores}
        members={members}
        recentLogs={[]}
        monthlyScores={monthlyScores}
      />,
    );
    await expect.element(screen.getByText("Alice")).toBeVisible();
    await expect.element(screen.getByText("45 pts")).toBeVisible();
    await expect.element(screen.getByText("Bob")).toBeVisible();
    await expect.element(screen.getByText("32 pts")).toBeVisible();
  });

  it("shows 'No chores yet' in empty member columns", async () => {
    const screen = await render(
      <ChoreBoard
        chores={chores}
        members={members}
        recentLogs={[]}
        monthlyScores={monthlyScores}
      />,
    );
    const empties = screen.getByText("No chores yet");
    await expect.element(empties.first()).toBeVisible();
  });

  it("renders icon chips for recent logs in member columns", async () => {
    const recentLogs = [
      {
        id: 1,
        choreId: 1,
        memberId: 1,
        pointsEarned: 5,
        loggedAt: new Date(),
      },
      {
        id: 2,
        choreId: 2,
        memberId: 2,
        pointsEarned: 3,
        loggedAt: new Date(),
      },
    ];
    const screen = await render(
      <ChoreBoard
        chores={chores}
        members={members}
        recentLogs={recentLogs}
        monthlyScores={monthlyScores}
      />,
    );
    // Icon chips should have title attributes
    await expect.element(screen.getByTitle("Dishes")).toBeVisible();
    await expect.element(screen.getByTitle("Laundry")).toBeVisible();
  });

  it("renders FAB button", async () => {
    const screen = await render(
      <ChoreBoard
        chores={chores}
        members={members}
        recentLogs={[]}
        monthlyScores={monthlyScores}
      />,
    );
    await expect
      .element(screen.getByRole("button", { name: "Log Chore" }))
      .toBeVisible();
  });

  it("shows no members message when members list is empty", async () => {
    const screen = await render(
      <ChoreBoard
        chores={chores}
        members={[]}
        recentLogs={[]}
        monthlyScores={[]}
      />,
    );
    await expect.element(screen.getByText(/No members yet/)).toBeVisible();
  });
});
