import { describe, it } from "node:test";
import assert from "node:assert";

void describe("Garbage icons", () => {
  void it("exports empty and fill variants", async () => {
    const mod = await import("./garbage.tsx");
    assert.ok(typeof mod.GarbageEmpty === "function");
    assert.ok(typeof mod.GarbageFill === "function");
  });
});
