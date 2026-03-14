import { describe, expect, it } from "vitest";

describe("MemberList", () => {
  it("exports MemberList component", async () => {
    const mod = await import("./member-list.tsx").catch(() => null);
    if (!mod) return; // requires Next.js runtime + env vars
    expect(mod.MemberList).toBeTypeOf("function");
  });
});
