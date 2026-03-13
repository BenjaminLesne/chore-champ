import { describe, it } from "node:test";
import assert from "node:assert";
import { registerSchema, loginSchema } from "./schemas.ts";

void describe("auth action schemas", () => {
  void describe("registerSchema", () => {
    void it("accepts valid registration data", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        householdName: "My House",
        memberName: "Admin User",
      });
      assert.strictEqual(result.success, true);
    });

    void it("rejects invalid email", () => {
      const result = registerSchema.safeParse({
        email: "not-an-email",
        password: "password123",
        householdName: "My House",
        memberName: "Admin User",
      });
      assert.strictEqual(result.success, false);
    });

    void it("rejects short password", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "short",
        householdName: "My House",
        memberName: "Admin User",
      });
      assert.strictEqual(result.success, false);
    });

    void it("rejects empty household name", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        householdName: "",
        memberName: "Admin User",
      });
      assert.strictEqual(result.success, false);
    });
  });

  void describe("loginSchema", () => {
    void it("accepts valid login data", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      assert.strictEqual(result.success, true);
    });

    void it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "bad",
        password: "password123",
      });
      assert.strictEqual(result.success, false);
    });
  });
});
