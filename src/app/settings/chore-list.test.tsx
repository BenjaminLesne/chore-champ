import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

vi.mock("@/server/chores/actions", () => ({
  createChore: vi.fn(),
  updateChore: vi.fn(),
  deleteChore: vi.fn(),
}));

const { ChoreList } = await import("./chore-list.tsx");

const chores = [
  {
    id: 1,
    name: "Dishes",
    iconName: "dishwasher",
    iconStyle: "empty",
    points: 5,
  },
  { id: 2, name: "Trash", iconName: "garbage", iconStyle: "fill", points: 2 },
];

describe("ChoreList", () => {
  it("shows empty state when no chores", async () => {
    const screen = await render(<ChoreList chores={[]} />);
    await expect
      .element(screen.getByText("No chores yet. Add one above."))
      .toBeVisible();
  });

  it("renders chore names and points", async () => {
    const screen = await render(<ChoreList chores={chores} />);
    await expect.element(screen.getByText("Dishes")).toBeVisible();
    await expect.element(screen.getByText("5 pts")).toBeVisible();
    await expect.element(screen.getByText("Trash")).toBeVisible();
    await expect.element(screen.getByText("2 pts")).toBeVisible();
  });

  it("renders the add chore form", async () => {
    const screen = await render(<ChoreList chores={[]} />);
    await expect.element(screen.getByText("Add chore")).toBeVisible();
    await expect.element(screen.getByPlaceholder("Chore name")).toBeVisible();
  });

  it("shows Edit and Delete buttons for each chore", async () => {
    const screen = await render(<ChoreList chores={chores} />);
    const editButtons = screen.getByText("Edit");
    await expect.element(editButtons.first()).toBeVisible();
    const deleteButtons = screen.getByText("Delete");
    await expect.element(deleteButtons.first()).toBeVisible();
  });
});
