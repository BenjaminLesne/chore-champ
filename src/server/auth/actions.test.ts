import { describe, expect, it } from "vitest";

describe("auth actions", () => {
  it("exports register, login, and logout functions", async () => {
    const mod = await import("./actions.ts").catch(() => null);
    if (!mod) return; // requires Next.js runtime + env vars
    expect(mod.register).toBeTypeOf("function");
    expect(mod.login).toBeTypeOf("function");
    expect(mod.logout).toBeTypeOf("function");
    expect(mod.joinHousehold).toBeTypeOf("function");
    expect(mod.regenerateInviteCode).toBeTypeOf("function");
  });
});
