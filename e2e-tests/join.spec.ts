import { test, expect } from "@playwright/test";

test.describe("Join page", () => {
  test("renders join form", async ({ page }) => {
    await page.goto("/join");

    await expect(
      page.getByRole("heading", { name: "Chore Champ" }),
    ).toBeVisible();
    await expect(page.getByLabel("Invite code")).toBeVisible();
    await expect(page.getByLabel("Your name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Join household" }),
    ).toBeVisible();
  });

  test("pre-fills invite code from query param", async ({ page }) => {
    await page.goto("/join?code=TESTCODE");

    await expect(page.getByLabel("Invite code")).toHaveValue("TESTCODE");
  });

  test("shows error for invalid invite code", async ({ page }) => {
    await page.goto("/join");

    await page.getByLabel("Invite code").fill("ZZZZZZZZ");
    await page.getByLabel("Your name").fill("Test Roommate");
    await page.getByLabel("Email").fill("roommate@test.com");
    await page.getByLabel("Password").fill("testpassword123");
    await page.getByRole("button", { name: "Join household" }).click();

    await expect(page.getByText("Invalid invite code")).toBeVisible();
  });

  test("navigates to login page", async ({ page }) => {
    await page.goto("/join");

    await page.getByRole("link", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/login/);
  });

  test("navigates to register page", async ({ page }) => {
    await page.goto("/join");

    await page.getByRole("link", { name: "Register" }).click();

    await expect(page).toHaveURL(/\/register/);
  });
});
