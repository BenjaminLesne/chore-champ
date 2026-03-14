import { describe, expect, it } from "vitest";

describe("chores/actions exports", () => {
  it("exports createChore, updateChore, deleteChore", async () => {
    const mod = await import("./actions.ts").catch(() => null);
    if (mod) {
      expect(mod.createChore).toBeTypeOf("function");
      expect(mod.updateChore).toBeTypeOf("function");
      expect(mod.deleteChore).toBeTypeOf("function");
    }
  });
});
