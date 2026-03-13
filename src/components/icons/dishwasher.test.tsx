import { describe, it } from "node:test";
import assert from "node:assert";

void describe("Dishwasher icons", () => {
  void it("exports empty and fill variants", async () => {
    const mod = await import("./dishwasher.tsx");
    assert.ok(typeof mod.DishwasherEmpty === "function");
    assert.ok(typeof mod.DishwasherFill === "function");
  });
});
