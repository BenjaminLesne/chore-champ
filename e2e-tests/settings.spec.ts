import { test, expect } from "./fixtures";

test.describe("Settings page", () => {
  test("renders settings page with member and chore sections", async ({
    page,
  }) => {
    await page.goto("/settings");

    await expect(
      page.getByRole("heading", { name: "Household Settings" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Members" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Chores" })).toBeVisible();
  });

  test("shows dashboard link", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
  });

  test("navigates back to dashboard", async ({ page }) => {
    await page.goto("/settings");

    await page.getByRole("link", { name: "Dashboard" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("displays the registered user as a member", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByText("Test User")).toBeVisible();
  });
});
