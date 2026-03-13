import { describe, it } from "node:test";
import assert from "node:assert";

void describe("ChoreBoard", () => {
  void it("exports ChoreBoard component", async () => {
    const mod = await import("./chore-board.tsx");
    assert.ok(typeof mod.ChoreBoard === "function");
  });
});
