import { describe, expect, it } from "vitest";
import { generateInviteCode } from "./invite-code.ts";

describe("generateInviteCode", () => {
  it("returns an 8-character string", () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(8);
  });

  it("only contains unambiguous uppercase alphanumeric characters", () => {
    const allowed = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]+$/;
    for (let i = 0; i < 50; i++) {
      expect(generateInviteCode()).toMatch(allowed);
    }
  });

  it("generates unique codes", () => {
    const codes = new Set(
      Array.from({ length: 100 }, () => generateInviteCode()),
    );
    expect(codes.size).toBe(100);
  });
});
