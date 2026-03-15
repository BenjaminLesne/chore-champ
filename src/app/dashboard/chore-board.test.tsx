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

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const { ChoreBoard } = await import("./chore-board.tsx");

const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

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
    iconColor: "#3b82f6",
    points: 5,
  },
  {
    id: 2,
    name: "Laundry",
    iconName: "washing_machine",
    iconStyle: "fill",
    iconColor: "#3b82f6",
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
        currentMonth={currentMonth}
      />,
    );
    await expect.element(screen.getByText(/No chores yet/)).toBeVisible();
    await expect.element(screen.getByText("Settings")).toBeVisible();
  });

  it("renders member column headers with names and points", async () => {
    const screen = await render(
      <ChoreBoard
        chores={chores}
        members={members}
        recentLogs={[]}
        monthlyScores={monthlyScores}
        currentMonth={currentMonth}
      />,
    );
    await expect.element(screen.getByText("Alice")).toBeVisible();
    await expect.element(screen.getByText("45 pts")).toBeVisible();
    await expect.element(screen.getByText("Bob")).toBeVisible();
    await expect.element(screen.getByText("32 pts")).toBeVisible();
  });

  it("shows empty month message when no logs", async () => {
    const screen = await render(
      <ChoreBoard
        chores={chores}
        members={members}
        recentLogs={[]}
        monthlyScores={monthlyScores}
        currentMonth={currentMonth}
      />,
    );
    await expect
      .element(screen.getByText("No chores logged this month"))
      .toBeVisible();
  });

  it("renders icon chips grouped by day for recent logs", async () => {
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
        currentMonth={currentMonth}
      />,
    );
    await expect.element(screen.getByText("Today")).toBeVisible();
    await expect.element(screen.getByTitle("Dishes")).toBeVisible();
    await expect.element(screen.getByTitle("Laundry")).toBeVisible();
  });

  it("renders month selector with prev/next buttons", async () => {
    const screen = await render(
      <ChoreBoard
        chores={chores}
        members={members}
        recentLogs={[]}
        monthlyScores={monthlyScores}
        currentMonth={currentMonth}
      />,
    );
    await expect
      .element(screen.getByRole("button", { name: "Previous month" }))
      .toBeVisible();
  });

  it("shows no members message when members list is empty", async () => {
    const screen = await render(
      <ChoreBoard
        chores={chores}
        members={[]}
        recentLogs={[]}
        monthlyScores={[]}
        currentMonth={currentMonth}
      />,
    );
    await expect.element(screen.getByText(/No members yet/)).toBeVisible();
  });
});
