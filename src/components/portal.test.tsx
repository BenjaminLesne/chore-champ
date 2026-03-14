import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { Portal } from "./portal.tsx";

describe("Portal", () => {
  it("renders children into document.body", async () => {
    const screen = await render(
      <Portal>
        <div data-testid="portal-child">Hello</div>
      </Portal>,
    );

    await expect.element(screen.getByTestId("portal-child")).toBeVisible();
  });
});
