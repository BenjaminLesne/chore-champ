import { describe, it } from "node:test";
import assert from "node:assert";
import { hashPassword, verifyPassword } from "./password.ts";

void describe("password utilities", () => {
  void it("hashes a password and verifies it correctly", async () => {
    const password = "test-password-123";
    const hash = await hashPassword(password);

    assert.notStrictEqual(hash, password);
    assert.strictEqual(await verifyPassword(password, hash), true);
  });

  void it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-password");
    assert.strictEqual(await verifyPassword("wrong-password", hash), false);
  });

  void it("produces different hashes for the same password", async () => {
    const password = "same-password";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    assert.notStrictEqual(hash1, hash2);
  });
});
