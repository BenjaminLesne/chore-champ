import { describe, expect, it } from "vitest";
import { DishwasherEmpty, DishwasherFill } from "./dishwasher.tsx";

describe("Dishwasher icons", () => {
  it("exports empty and fill variants", () => {
    expect(DishwasherEmpty).toBeTypeOf("function");
    expect(DishwasherFill).toBeTypeOf("function");
  });
});
