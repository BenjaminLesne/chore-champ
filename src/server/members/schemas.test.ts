import { describe, expect, it } from "vitest";
import {
  createMemberSchema,
  updateMemberSchema,
  deleteMemberSchema,
} from "./schemas.ts";

describe("createMemberSchema", () => {
  it("accepts valid input with name only", () => {
    expect(createMemberSchema.safeParse({ name: "Alice" }).success).toBe(true);
  });

  it("accepts valid input with name and avatarUrl", () => {
    expect(
      createMemberSchema.safeParse({
        name: "Alice",
        avatarUrl: "https://example.com/avatar.png",
      }).success,
    ).toBe(true);
  });

  it("accepts empty string for avatarUrl", () => {
    expect(
      createMemberSchema.safeParse({ name: "Alice", avatarUrl: "" }).success,
    ).toBe(true);
  });

  it("rejects empty name", () => {
    expect(createMemberSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects invalid avatarUrl", () => {
    expect(
      createMemberSchema.safeParse({ name: "Alice", avatarUrl: "not-a-url" })
        .success,
    ).toBe(false);
  });
});

describe("updateMemberSchema", () => {
  it("accepts valid input", () => {
    expect(
      updateMemberSchema.safeParse({ memberId: 1, name: "Bob" }).success,
    ).toBe(true);
  });

  it("rejects non-positive memberId", () => {
    expect(
      updateMemberSchema.safeParse({ memberId: 0, name: "Bob" }).success,
    ).toBe(false);
  });
});

describe("deleteMemberSchema", () => {
  it("accepts valid memberId", () => {
    expect(deleteMemberSchema.safeParse({ memberId: 1 }).success).toBe(true);
  });

  it("rejects missing memberId", () => {
    expect(deleteMemberSchema.safeParse({}).success).toBe(false);
  });
});
