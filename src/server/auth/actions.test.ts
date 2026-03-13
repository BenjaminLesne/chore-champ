import { describe, it } from "node:test";
import assert from "node:assert";

void describe("auth actions", () => {
  void it("exports register, login, and logout functions", async () => {
    // Server actions depend on Next.js runtime (cookies, redirect) and database,
    // so we verify the module structure rather than running them in unit tests.
    // Integration testing with a real database would be done separately.
    const mod = await import("./actions.ts");
    assert.strictEqual(typeof mod.register, "function");
    assert.strictEqual(typeof mod.login, "function");
    assert.strictEqual(typeof mod.logout, "function");
  });
});
