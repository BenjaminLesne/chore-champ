import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

vi.mock("@/server/chores/actions", () => ({
  createChore: vi.fn(),
}));

const { CreateChoreButton } = await import("./create-chore-button.tsx");

describe("CreateChoreButton", () => {
  it("renders a button with New Chore text", async () => {
    const screen = await render(<CreateChoreButton />);
    await expect
      .element(screen.getByRole("button", { name: /New Chore/ }))
      .toBeVisible();
  });

  it("opens modal on click with form fields", async () => {
    const screen = await render(<CreateChoreButton />);
    await screen.getByRole("button", { name: /New Chore/ }).click();
    await expect.element(screen.getByLabelText("Name")).toBeVisible();
    await expect.element(screen.getByLabelText("Points")).toBeVisible();
  });
});
