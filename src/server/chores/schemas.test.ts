import { describe, it } from "node:test";
import assert from "node:assert";
import {
  createChoreSchema,
  updateChoreSchema,
  deleteChoreSchema,
} from "./schemas.ts";

void describe("createChoreSchema", () => {
  void it("accepts valid input", () => {
    const result = createChoreSchema.safeParse({
      name: "Dishes",
      iconName: "dishwasher",
      iconStyle: "empty",
      points: 5,
    });
    assert.strictEqual(result.success, true);
  });

  void it("rejects empty name", () => {
    const result = createChoreSchema.safeParse({
      name: "",
      iconName: "dishwasher",
      iconStyle: "empty",
      points: 5,
    });
    assert.strictEqual(result.success, false);
  });

  void it("rejects invalid icon name", () => {
    const result = createChoreSchema.safeParse({
      name: "Dishes",
      iconName: "invalid_icon",
      iconStyle: "empty",
      points: 5,
    });
    assert.strictEqual(result.success, false);
  });

  void it("rejects invalid icon style", () => {
    const result = createChoreSchema.safeParse({
      name: "Dishes",
      iconName: "dishwasher",
      iconStyle: "outline",
      points: 5,
    });
    assert.strictEqual(result.success, false);
  });

  void it("rejects zero points", () => {
    const result = createChoreSchema.safeParse({
      name: "Dishes",
      iconName: "dishwasher",
      iconStyle: "empty",
      points: 0,
    });
    assert.strictEqual(result.success, false);
  });

  void it("rejects negative points", () => {
    const result = createChoreSchema.safeParse({
      name: "Dishes",
      iconName: "dishwasher",
      iconStyle: "empty",
      points: -3,
    });
    assert.strictEqual(result.success, false);
  });

  void it("rejects non-integer points", () => {
    const result = createChoreSchema.safeParse({
      name: "Dishes",
      iconName: "dishwasher",
      iconStyle: "empty",
      points: 2.5,
    });
    assert.strictEqual(result.success, false);
  });

  void it("accepts all valid icon names", () => {
    for (const iconName of ["washing_machine", "dishwasher", "garbage"]) {
      const result = createChoreSchema.safeParse({
        name: "Test",
        iconName,
        iconStyle: "fill",
        points: 1,
      });
      assert.strictEqual(result.success, true, `Failed for icon: ${iconName}`);
    }
  });
});

void describe("updateChoreSchema", () => {
  void it("accepts valid input", () => {
    const result = updateChoreSchema.safeParse({
      choreId: 1,
      name: "Laundry",
      iconName: "washing_machine",
      iconStyle: "fill",
      points: 10,
    });
    assert.strictEqual(result.success, true);
  });

  void it("rejects non-positive choreId", () => {
    const result = updateChoreSchema.safeParse({
      choreId: 0,
      name: "Laundry",
      iconName: "washing_machine",
      iconStyle: "fill",
      points: 10,
    });
    assert.strictEqual(result.success, false);
  });
});

void describe("deleteChoreSchema", () => {
  void it("accepts valid choreId", () => {
    const result = deleteChoreSchema.safeParse({ choreId: 1 });
    assert.strictEqual(result.success, true);
  });

  void it("rejects missing choreId", () => {
    const result = deleteChoreSchema.safeParse({});
    assert.strictEqual(result.success, false);
  });
});
