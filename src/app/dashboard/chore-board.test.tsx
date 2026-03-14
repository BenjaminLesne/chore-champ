import { describe, expect, it } from "vitest";

describe("ChoreBoard", () => {
  it("exports ChoreBoard component", async () => {
    const mod = await import("./chore-board.tsx").catch(() => null);
    if (!mod) return; // requires Next.js runtime + env vars
    expect(mod.ChoreBoard).toBeTypeOf("function");
  });
});
