import { test, expect } from "./fixtures";

test.describe("Past Winners", () => {
  test("displays winner name and points for a past month", async ({ page }) => {
    // Step 1: Create a chore via the dashboard
    await page.getByRole("button", { name: "New Chore" }).click();
    await page.getByLabel("Name").fill("Dishes");
    await page.getByLabel("Points").fill("5");

    // Pick an icon
    await page.getByRole("button", { name: "Pick an icon" }).click();
    const popoverDialog = page.locator("[role='dialog']");
    await expect(popoverDialog).toBeVisible();
    await popoverDialog.locator("button[title]").first().click();

    // Submit and wait for action to complete (modal closes on success)
    await page.getByRole("button", { name: "Create Chore" }).click();
    await expect(
      page.getByRole("heading", { name: "New Chore" }),
    ).not.toBeVisible({ timeout: 10000 });

    // Reload to see the chore
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Chore Board" }),
    ).toBeVisible();

    // Step 2: Log the chore for a date in the previous month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const pastDate = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}-15`;

    await page.getByRole("button", { name: "Log Chore" }).click();
    await expect(page.getByText("Who's logging?")).toBeVisible();

    // Select the member
    await page.getByRole("button", { name: "Test User" }).click();

    // Set the date to last month
    await page.locator("input[type='date']").fill(pastDate);

    // Click the Dishes chore card in the log modal
    await page.getByRole("button", { name: /Dishes/ }).click();

    // Confirm the log — wait for the POST to complete
    await expect(page.getByRole("button", { name: "Confirm" })).toBeVisible();
    const responsePromise = page.waitForResponse(
      (resp) => resp.request().method() === "POST" && resp.status() === 200,
    );
    await page.getByRole("button", { name: "Confirm" }).click();
    await responsePromise;

    // Wait for the confirmation dialog to close
    await expect(page.getByRole("button", { name: "Confirm" })).not.toBeVisible(
      {
        timeout: 10000,
      },
    );

    // Step 3: Reload dashboard
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Chore Board" }),
    ).toBeVisible();

    // Step 4: Verify the Past Winners section renders with the winner name visible
    await expect(
      page.getByRole("heading", { name: "Past Winners" }),
    ).toBeVisible({ timeout: 10000 });

    // The winner name should be visible within the past winners container
    // Use the parent of the heading to scope the assertion
    const winnersContainer = page
      .getByRole("heading", { name: "Past Winners" })
      .locator("..");
    await expect(winnersContainer.getByText("Test User")).toBeVisible();
  });
});
