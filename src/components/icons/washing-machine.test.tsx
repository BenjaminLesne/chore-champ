import { describe, expect, it } from "vitest";
import { WashingMachineEmpty, WashingMachineFill } from "./washing-machine.tsx";

describe("WashingMachine icons", () => {
  it("exports empty and fill variants", () => {
    expect(WashingMachineEmpty).toBeTypeOf("function");
    expect(WashingMachineFill).toBeTypeOf("function");
  });
});
