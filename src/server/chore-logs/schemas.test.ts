import { describe, expect, it } from "vitest";
import { logChoreSchema, undoChoreLogSchema } from "./schemas.ts";

describe("logChoreSchema", () => {
  it("accepts valid input", () => {
    expect(logChoreSchema.safeParse({ choreId: 1, memberId: 2 }).success).toBe(
      true,
    );
  });

  it("rejects missing choreId", () => {
    expect(logChoreSchema.safeParse({ memberId: 2 }).success).toBe(false);
  });

  it("rejects missing memberId", () => {
    expect(logChoreSchema.safeParse({ choreId: 1 }).success).toBe(false);
  });

  it.each([0, -1])("rejects non-positive choreId=%i", (choreId) => {
    expect(logChoreSchema.safeParse({ choreId, memberId: 1 }).success).toBe(
      false,
    );
  });

  it("rejects non-positive memberId", () => {
    expect(logChoreSchema.safeParse({ choreId: 1, memberId: -1 }).success).toBe(
      false,
    );
  });
});

describe("undoChoreLogSchema", () => {
  it("accepts valid logId", () => {
    expect(undoChoreLogSchema.safeParse({ logId: 1 }).success).toBe(true);
  });

  it("rejects missing logId", () => {
    expect(undoChoreLogSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-positive logId", () => {
    expect(undoChoreLogSchema.safeParse({ logId: 0 }).success).toBe(false);
  });

  it("rejects non-integer logId", () => {
    expect(undoChoreLogSchema.safeParse({ logId: 1.5 }).success).toBe(false);
  });
});
