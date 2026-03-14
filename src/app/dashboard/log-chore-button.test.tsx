import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

vi.mock("nuqs", () => ({
  useQueryState: () => [null, vi.fn()],
}));

const { LogChoreButton } = await import("./log-chore-button.tsx");

describe("LogChoreButton", () => {
  it("renders a button with Log Chore text", async () => {
    const screen = await render(<LogChoreButton />);
    await expect
      .element(screen.getByRole("button", { name: /Log Chore/ }))
      .toBeVisible();
  });
});
