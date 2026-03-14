import { describe, expect, it } from "vitest";
import { registerSchema, loginSchema } from "./schemas.ts";

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
