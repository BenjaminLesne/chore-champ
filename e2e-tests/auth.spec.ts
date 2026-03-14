import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("renders login form", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Chore Champ" }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create one" })).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("nonexistent@test.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("navigates to register page", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: "Create one" }).click();

    await expect(page).toHaveURL(/\/register/);
  });
});

test.describe("Register page", () => {
  test("renders registration form", async ({ page }) => {
    await page.goto("/register");

    await expect(
      page.getByRole("heading", { name: "Chore Champ" }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByLabel("Household name")).toBeVisible();
    await expect(page.getByLabel("Your name")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create account" }),
    ).toBeVisible();
  });

  test("registers and redirects to dashboard", async ({ page }) => {
    const uniqueEmail = `e2e-register-${Date.now()}@test.com`;

    await page.goto("/register");

    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password").fill("testpassword123");
    await page.getByLabel("Household name").fill("Test Household");
    await page.getByLabel("Your name").fill("Test User");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { name: "Chore Board" }),
    ).toBeVisible();
  });

  test("navigates to login page", async ({ page }) => {
    await page.goto("/register");

    await page.getByRole("link", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/login/);
  });
});
