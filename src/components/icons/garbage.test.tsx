import { describe, expect, it } from "vitest";
import { GarbageEmpty, GarbageFill } from "./garbage.tsx";

describe("Garbage icons", () => {
  it("exports empty and fill variants", () => {
    expect(GarbageEmpty).toBeTypeOf("function");
    expect(GarbageFill).toBeTypeOf("function");
  });
});
