import { test, expect } from "./fixtures";

// @route /dashboard
test.describe("Dashboard page", () => {
  test("renders chore board heading and layout", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Chore Board" }),
    ).toBeVisible();
  });

  test("shows navigation links", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Insights" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Settings" }).first(),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  });

  test("displays scoreboard section", async ({ page }) => {
    await expect(page.getByText("Scoreboard")).toBeVisible();
  });

  test("navigates to settings", async ({ page }) => {
    await page.getByRole("link", { name: "Settings" }).first().click();

    await expect(page).toHaveURL(/\/settings/);
    await expect(
      page.getByRole("heading", { name: "Household Settings" }),
    ).toBeVisible();
  });

  test("navigates to insights", async ({ page }) => {
    await page.getByRole("link", { name: "Insights" }).click();

    await expect(page).toHaveURL(/\/insights/);
    await expect(page.getByRole("heading", { name: "Insights" })).toBeVisible();
  });

  test("sign out redirects to login", async ({ page }) => {
    await page.getByRole("button", { name: "Sign out" }).click();

    await expect(page).toHaveURL(/\/login/);
  });
});
