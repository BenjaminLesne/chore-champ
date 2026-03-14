import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { InviteCodeSection } from "./invite-code-section.tsx";

vi.mock("@/server/auth/actions", () => ({
  regenerateInviteCode: vi.fn().mockResolvedValue({ inviteCode: "NEW12345" }),
}));

describe("InviteCodeSection", () => {
  it("renders the invite code", async () => {
    const screen = await render(<InviteCodeSection initialCode="ABCD1234" />);

    await expect.element(screen.getByText("ABCD1234")).toBeVisible();
    await expect.element(screen.getByText("Invite Code")).toBeVisible();
    await expect.element(screen.getByText("Copy")).toBeVisible();
    await expect.element(screen.getByText("Regenerate")).toBeVisible();
  });
});
