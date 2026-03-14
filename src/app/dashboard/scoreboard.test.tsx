import { describe, expect, it } from "vitest";

describe("Scoreboard", () => {
  it("exports Scoreboard component", async () => {
    const mod = await import("./scoreboard.tsx");
    expect(mod.Scoreboard).toBeTypeOf("function");
  });
});
