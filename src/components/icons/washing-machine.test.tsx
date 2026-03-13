import { describe, it } from "node:test";
import assert from "node:assert";

void describe("WashingMachine icons", () => {
  void it("exports empty and fill variants", async () => {
    const mod = await import("./washing-machine.tsx");
    assert.ok(typeof mod.WashingMachineEmpty === "function");
    assert.ok(typeof mod.WashingMachineFill === "function");
  });
});
