import { describe, it } from "node:test";
import assert from "node:assert";
import {
  createMemberSchema,
  updateMemberSchema,
  deleteMemberSchema,
} from "./schemas.ts";

void describe("createMemberSchema", () => {
  void it("accepts valid input with name only", () => {
    const result = createMemberSchema.safeParse({ name: "Alice" });
    assert.strictEqual(result.success, true);
  });

  void it("accepts valid input with name and avatarUrl", () => {
    const result = createMemberSchema.safeParse({
      name: "Alice",
      avatarUrl: "https://example.com/avatar.png",
    });
    assert.strictEqual(result.success, true);
  });

  void it("accepts empty string for avatarUrl", () => {
    const result = createMemberSchema.safeParse({
      name: "Alice",
      avatarUrl: "",
    });
    assert.strictEqual(result.success, true);
  });

  void it("rejects empty name", () => {
    const result = createMemberSchema.safeParse({ name: "" });
    assert.strictEqual(result.success, false);
  });

  void it("rejects invalid avatarUrl", () => {
    const result = createMemberSchema.safeParse({
      name: "Alice",
      avatarUrl: "not-a-url",
    });
    assert.strictEqual(result.success, false);
  });
});

void describe("updateMemberSchema", () => {
  void it("accepts valid input", () => {
    const result = updateMemberSchema.safeParse({
      memberId: 1,
      name: "Bob",
    });
    assert.strictEqual(result.success, true);
  });

  void it("rejects non-positive memberId", () => {
    const result = updateMemberSchema.safeParse({
      memberId: 0,
      name: "Bob",
    });
    assert.strictEqual(result.success, false);
  });
});

void describe("deleteMemberSchema", () => {
  void it("accepts valid memberId", () => {
    const result = deleteMemberSchema.safeParse({ memberId: 1 });
    assert.strictEqual(result.success, true);
  });

  void it("rejects missing memberId", () => {
    const result = deleteMemberSchema.safeParse({});
    assert.strictEqual(result.success, false);
  });
});
