import { describe, it } from "node:test";
import assert from "node:assert";
import { createSessionToken, parseSessionToken } from "./session.ts";

void describe("session token utilities", () => {
  const secret = "test-secret-that-is-at-least-32-characters-long";

  void it("creates and parses a valid session token", async () => {
    const payload = { adminId: 1, householdId: 2 };
    const token = await createSessionToken(payload, secret);

    assert.ok(typeof token === "string");
    assert.ok(token.length > 0);

    const parsed = await parseSessionToken(token, secret);
    assert.deepStrictEqual(parsed, payload);
  });

  void it("returns null for a tampered token", async () => {
    const payload = { adminId: 1, householdId: 2 };
    const token = await createSessionToken(payload, secret);
    const tampered = token.slice(0, -1) + "x";

    const parsed = await parseSessionToken(tampered, secret);
    assert.strictEqual(parsed, null);
  });

  void it("returns null for an invalid token format", async () => {
    const parsed = await parseSessionToken("not-a-valid-token", secret);
    assert.strictEqual(parsed, null);
  });

  void it("returns null when verified with a different secret", async () => {
    const payload = { adminId: 1, householdId: 2 };
    const token = await createSessionToken(payload, secret);

    const parsed = await parseSessionToken(
      token,
      "different-secret-that-is-at-least-32-chars-long",
    );
    assert.strictEqual(parsed, null);
  });
});
