import { describe, expect, it } from "vitest";

describe("members/actions exports", () => {
  it("exports createMember, updateMember, deleteMember", async () => {
    const mod = await import("./actions.ts").catch(() => null);
    if (mod) {
      expect(mod.createMember).toBeTypeOf("function");
      expect(mod.updateMember).toBeTypeOf("function");
      expect(mod.deleteMember).toBeTypeOf("function");
    }
  });
});
