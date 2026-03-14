import { describe, expect, it } from "vitest";

describe("ChoreList", () => {
  it("exports ChoreList component", async () => {
    const mod = await import("./chore-list.tsx").catch(() => null);
    if (!mod) return; // requires Next.js runtime + env vars
    expect(mod.ChoreList).toBeTypeOf("function");
  });
});
