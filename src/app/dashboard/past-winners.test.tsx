import { describe, it } from "node:test";
import assert from "node:assert";

void describe("PastWinners", () => {
  void it("exports PastWinners component", async () => {
    const mod = await import("./past-winners.tsx");
    assert.ok(typeof mod.PastWinners === "function");
  });
});
