import { describe, it } from "node:test";
import assert from "node:assert";
import { logChoreSchema, undoChoreLogSchema } from "./schemas.ts";

void describe("logChoreSchema", () => {
  void it("accepts valid input", () => {
    const result = logChoreSchema.safeParse({ choreId: 1, memberId: 2 });
    assert.strictEqual(result.success, true);
  });

  void it("rejects missing choreId", () => {
    const result = logChoreSchema.safeParse({ memberId: 2 });
    assert.strictEqual(result.success, false);
  });

  void it("rejects missing memberId", () => {
    const result = logChoreSchema.safeParse({ choreId: 1 });
    assert.strictEqual(result.success, false);
  });

  void it("rejects non-positive choreId", () => {
    const result = logChoreSchema.safeParse({ choreId: 0, memberId: 1 });
    assert.strictEqual(result.success, false);
  });

  void it("rejects non-positive memberId", () => {
    const result = logChoreSchema.safeParse({ choreId: 1, memberId: -1 });
    assert.strictEqual(result.success, false);
  });
});

void describe("undoChoreLogSchema", () => {
  void it("accepts valid logId", () => {
    const result = undoChoreLogSchema.safeParse({ logId: 1 });
    assert.strictEqual(result.success, true);
  });

  void it("rejects missing logId", () => {
    const result = undoChoreLogSchema.safeParse({});
    assert.strictEqual(result.success, false);
  });

  void it("rejects non-positive logId", () => {
    const result = undoChoreLogSchema.safeParse({ logId: 0 });
    assert.strictEqual(result.success, false);
  });

  void it("rejects non-integer logId", () => {
    const result = undoChoreLogSchema.safeParse({ logId: 1.5 });
    assert.strictEqual(result.success, false);
  });
});
