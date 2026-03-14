import { describe, expect, it } from "vitest";
import { createSessionToken, parseSessionToken } from "./session.ts";

describe("session token utilities", () => {
  const secret = "test-secret-that-is-at-least-32-characters-long";

  it("creates and parses a valid session token", async () => {
    const payload = { adminId: 1, householdId: 2 };
    const token = await createSessionToken(payload, secret);

    expect(token).toBeTypeOf("string");
    expect(token.length).toBeGreaterThan(0);

    const parsed = await parseSessionToken(token, secret);
    expect(parsed).toEqual(payload);
  });

  it("returns null for a tampered token", async () => {
    const payload = { adminId: 1, householdId: 2 };
    const token = await createSessionToken(payload, secret);
    const tampered = token.slice(0, -1) + "x";

    expect(await parseSessionToken(tampered, secret)).toBeNull();
  });

  it("returns null for an invalid token format", async () => {
    expect(await parseSessionToken("not-a-valid-token", secret)).toBeNull();
  });

  it("returns null when verified with a different secret", async () => {
    const payload = { adminId: 1, householdId: 2 };
    const token = await createSessionToken(payload, secret);

    expect(
      await parseSessionToken(
        token,
        "different-secret-that-is-at-least-32-chars-long",
      ),
    ).toBeNull();
  });
});
