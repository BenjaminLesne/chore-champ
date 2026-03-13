import { describe, it } from "node:test";
import assert from "node:assert";

void describe("Scoreboard", () => {
  void it("exports Scoreboard component", async () => {
    const mod = await import("./scoreboard.tsx");
    assert.strictEqual(typeof mod.Scoreboard, "function");
  });
});
