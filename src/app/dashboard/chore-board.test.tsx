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

describe("ChoreBoard", () => {
  it("shows empty state when no chores", async () => {
    const screen = await render(
      <ChoreBoard chores={[]} members={members} recentLogs={[]} />,
    );
    await expect.element(screen.getByText(/No chores yet/)).toBeVisible();
    await expect.element(screen.getByText("Settings")).toBeVisible();
  });

  it("renders member selector buttons", async () => {
    const screen = await render(
      <ChoreBoard chores={chores} members={members} recentLogs={[]} />,
    );
    await expect
      .element(screen.getByRole("button", { name: "Alice" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: "Bob" }))
      .toBeVisible();
  });

  it("renders chore cards with names and points", async () => {
    const screen = await render(
      <ChoreBoard chores={chores} members={members} recentLogs={[]} />,
    );
    await expect.element(screen.getByText("Dishes")).toBeVisible();
    await expect.element(screen.getByText("5 pts")).toBeVisible();
    await expect.element(screen.getByText("Laundry")).toBeVisible();
    await expect.element(screen.getByText("3 pts")).toBeVisible();
  });

  it("shows 'Who's logging?' label", async () => {
    const screen = await render(
      <ChoreBoard chores={chores} members={members} recentLogs={[]} />,
    );
    await expect.element(screen.getByText(/logging/)).toBeVisible();
  });

  it("renders recent activity logs", async () => {
    const recentLogs = [
      {
        id: 1,
        choreId: 1,
        memberId: 1,
        pointsEarned: 5,
        loggedAt: new Date(),
      },
    ];
    const screen = await render(
      <ChoreBoard chores={chores} members={members} recentLogs={recentLogs} />,
    );
    await expect.element(screen.getByText("Recent Activity")).toBeVisible();
    await expect.element(screen.getByText("+5 pts")).toBeVisible();
    await expect.element(screen.getByText("Undo")).toBeVisible();
  });

  it("shows no members message when members list is empty", async () => {
    const screen = await render(
      <ChoreBoard chores={chores} members={[]} recentLogs={[]} />,
    );
    await expect.element(screen.getByText(/No members yet/)).toBeVisible();
  });
});
