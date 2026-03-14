import { test as base, expect } from "@playwright/test";

/**
 * Shared auth fixture: registers a fresh account and navigates to /dashboard
 * so that all downstream tests start in an authenticated state.
 *
 * Uses a unique email per test worker to avoid collisions in parallel runs.
 */
export const test = base.extend<{
  authedPage: ReturnType<(typeof base)["extend"]>;
}>({
  page: async ({ page }, use) => {
    const uniqueEmail = `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;

    // Register a new account
    await page.goto("/register");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password").fill("testpassword123");
    await page.getByLabel("Household name").fill("Test Household");
    await page.getByLabel("Your name").fill("Test User");
    await page.getByRole("button", { name: "Create account" }).click();

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    await use(page);
  },
});

export { expect } from "@playwright/test";
