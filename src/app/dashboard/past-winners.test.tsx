import { describe, expect, it } from "vitest";

describe("PastWinners", () => {
  it("exports PastWinners component", async () => {
    const mod = await import("./past-winners.tsx");
    expect(mod.PastWinners).toBeTypeOf("function");
  });
});
