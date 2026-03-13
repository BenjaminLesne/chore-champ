import { describe, it } from "node:test";
import assert from "node:assert";

void describe("chore-logs actions", () => {
  void it("exports logChore action", async () => {
    const mod = await import("./actions.ts");
    assert.strictEqual(typeof mod.logChore, "function");
  });

  void it("exports undoChoreLog action", async () => {
    const mod = await import("./actions.ts");
    assert.strictEqual(typeof mod.undoChoreLog, "function");
  });
});
