import { test, expect } from "./fixtures";

test.describe("Insights page", () => {
  test("renders insights page with heading", async ({ page }) => {
    await page.goto("/insights");

    await expect(page.getByRole("heading", { name: "Insights" })).toBeVisible();
  });

  test("shows back to board link", async ({ page }) => {
    await page.goto("/insights");

    await expect(
      page.getByRole("link", { name: "Back to Board" }),
    ).toBeVisible();
  });

  test("navigates back to dashboard", async ({ page }) => {
    await page.goto("/insights");

    await page.getByRole("link", { name: "Back to Board" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
