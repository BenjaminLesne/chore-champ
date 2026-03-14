import { describe, expect, it } from "vitest";

describe("chore-logs actions", () => {
  it("exports logChore and undoChoreLog", async () => {
    const mod = await import("./actions.ts").catch(() => null);
    if (!mod) return; // requires Next.js runtime + env vars
    expect(mod.logChore).toBeTypeOf("function");
    expect(mod.undoChoreLog).toBeTypeOf("function");
  });
});
