import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

vi.mock("@/server/members/actions", () => ({
  createMember: vi.fn(),
  updateMember: vi.fn(),
  deleteMember: vi.fn(),
  updateMemberRole: vi.fn(),
}));

// next/image can't be reliably mocked in browser mode, so we test with
// members that don't have an avatarUrl (which renders a <div> initial instead).
vi.mock("next/image", () => ({
  default: function MockImage({ src, alt }: { src: string; alt: string }) {
    return (
      <picture>
        <source srcSet={src} />
        <span>{alt}</span>
      </picture>
    );
  },
}));

const { MemberList } = await import("./member-list.tsx");

describe("MemberList", () => {
  it("shows empty state when no members", async () => {
    const screen = await render(
      <MemberList currentMemberId={99} members={[]} />,
    );
    await expect
      .element(screen.getByText("No members yet. Add one above."))
      .toBeVisible();
  });

  it("renders member names", async () => {
    const members = [
      { id: 1, name: "Alice", avatarUrl: null, isAdmin: false },
      { id: 2, name: "Bob", avatarUrl: null, isAdmin: false },
    ];
    const screen = await render(
      <MemberList currentMemberId={99} members={members} />,
    );
    await expect.element(screen.getByText("Alice")).toBeVisible();
    await expect.element(screen.getByText("Bob")).toBeVisible();
  });

  it("shows Admin badge for admin members", async () => {
    const members = [{ id: 1, name: "Alice", avatarUrl: null, isAdmin: true }];
    const screen = await render(
      <MemberList currentMemberId={99} members={members} />,
    );
    await expect
      .element(screen.getByText("Admin", { exact: true }))
      .toBeVisible();
  });

  it("renders the add member form", async () => {
    const screen = await render(
      <MemberList currentMemberId={99} members={[]} />,
    );
    await expect
      .element(screen.getByRole("button", { name: "Add member" }))
      .toBeVisible();
    await expect.element(screen.getByPlaceholder("Member name")).toBeVisible();
  });

  it("shows avatar initial when no avatar URL", async () => {
    const screen = await render(
      <MemberList
        currentMemberId={99}
        members={[{ id: 1, name: "Alice", avatarUrl: null, isAdmin: false }]}
      />,
    );
    await expect.element(screen.getByText("A", { exact: true })).toBeVisible();
  });

  it("hides Delete button for admin members", async () => {
    const screen = await render(
      <MemberList
        currentMemberId={99}
        members={[{ id: 1, name: "Alice", avatarUrl: null, isAdmin: true }]}
      />,
    );
    const deleteButtons = screen.container.querySelectorAll("button");
    const deleteTexts = Array.from(deleteButtons).filter(
      (b) => b.textContent === "Delete",
    );
    expect(deleteTexts).toHaveLength(0);
  });

  it("shows Edit button for each member", async () => {
    const members = [
      { id: 1, name: "Alice", avatarUrl: null, isAdmin: false },
      { id: 2, name: "Bob", avatarUrl: null, isAdmin: false },
    ];
    const screen = await render(
      <MemberList currentMemberId={99} members={members} />,
    );
    const editButtons = screen.getByText("Edit");
    await expect.element(editButtons.first()).toBeVisible();
  });
});
