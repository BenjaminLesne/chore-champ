import { describe, it } from "node:test";
import assert from "node:assert";
import { logChoreSchema } from "./schemas.ts";

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
