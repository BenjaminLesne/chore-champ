import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { PeriodSelector } from "./period-selector.tsx";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <NuqsTestingAdapter>{children}</NuqsTestingAdapter>;
}

describe("PeriodSelector", () => {
  it("renders all period options", async () => {
    const screen = await render(<PeriodSelector />, { wrapper: Wrapper });
    await expect.element(screen.getByText("Last 30 days")).toBeVisible();
    await expect.element(screen.getByText("Last 3 months")).toBeVisible();
    await expect.element(screen.getByText("Last 6 months")).toBeVisible();
    await expect.element(screen.getByText("All time")).toBeVisible();
  });

  it("defaults to Last 30 days", async () => {
    const screen = await render(<PeriodSelector />, { wrapper: Wrapper });
    const button = screen.getByText("Last 30 days");
    await expect.element(button).toHaveClass("bg-white");
  });

  it("switches period on click", async () => {
    const screen = await render(<PeriodSelector />, { wrapper: Wrapper });
    await screen.getByText("All time").click();
    await expect.element(screen.getByText("All time")).toHaveClass("bg-white");
  });
});
