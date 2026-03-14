import { describe, expect, it } from "vitest";
import { registerSchema, loginSchema, joinSchema } from "./schemas.ts";

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      householdName: "My House",
      memberName: "Admin User",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "password123",
      householdName: "My House",
      memberName: "Admin User",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "short",
      householdName: "My House",
      memberName: "Admin User",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty household name", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      householdName: "",
      memberName: "Admin User",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty member name", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      householdName: "My House",
      memberName: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "bad",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("joinSchema", () => {
  it("accepts valid join data", () => {
    const result = joinSchema.safeParse({
      inviteCode: "ABCD1234",
      email: "test@example.com",
      password: "password123",
      memberName: "Test User",
    });
    expect(result.success).toBe(true);
  });

  it("uppercases the invite code", () => {
    const result = joinSchema.safeParse({
      inviteCode: "abcd1234",
      email: "test@example.com",
      password: "password123",
      memberName: "Test User",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.inviteCode).toBe("ABCD1234");
    }
  });

  it("rejects invite code with wrong length", () => {
    const result = joinSchema.safeParse({
      inviteCode: "ABC",
      email: "test@example.com",
      password: "password123",
      memberName: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = joinSchema.safeParse({
      inviteCode: "ABCD1234",
      email: "test@example.com",
      password: "short",
      memberName: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty member name", () => {
    const result = joinSchema.safeParse({
      inviteCode: "ABCD1234",
      email: "test@example.com",
      password: "password123",
      memberName: "",
    });
    expect(result.success).toBe(false);
  });
});
