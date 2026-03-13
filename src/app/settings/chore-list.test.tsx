import { describe, it } from "node:test";
import assert from "node:assert/strict";

void describe("ChoreList", () => {
  void it("exports ChoreList component", async () => {
    const mod = await import("./chore-list.tsx");
    assert.equal(typeof mod.ChoreList, "function");
  });
});
