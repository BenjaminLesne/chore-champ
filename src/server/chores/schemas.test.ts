import { describe, expect, it } from "vitest";
import {
  createChoreSchema,
  updateChoreSchema,
  deleteChoreSchema,
} from "./schemas.ts";

describe("createChoreSchema", () => {
  it("accepts valid input with legacy icon names", () => {
    expect(
      createChoreSchema.safeParse({
        name: "Dishes",
        iconName: "dishwasher",
        iconStyle: "empty",
        points: 5,
      }).success,
    ).toBe(true);
  });

  it("accepts Lucide kebab-case icon names", () => {
    expect(
      createChoreSchema.safeParse({
        name: "Laundry",
        iconName: "washing-machine",
        iconStyle: "outline",
        points: 3,
      }).success,
    ).toBe(true);
  });

  it("accepts any string icon name up to 64 chars", () => {
    expect(
      createChoreSchema.safeParse({
        name: "Test",
        iconName: "some-custom-icon",
        iconStyle: "outline",
        points: 1,
      }).success,
    ).toBe(true);
  });

  it("rejects empty icon name", () => {
    expect(
      createChoreSchema.safeParse({
        name: "Dishes",
        iconName: "",
        iconStyle: "outline",
        points: 5,
      }).success,
    ).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      createChoreSchema.safeParse({
        name: "",
        iconName: "dishwasher",
        iconStyle: "empty",
        points: 5,
      }).success,
    ).toBe(false);
  });

  it("defaults iconStyle to outline when omitted", () => {
    const result = createChoreSchema.safeParse({
      name: "Dishes",
      iconName: "dishwasher",
      points: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.iconStyle).toBe("outline");
    }
  });

  it.each([0, -3])("rejects points=%i", (points) => {
    expect(
      createChoreSchema.safeParse({
        name: "Dishes",
        iconName: "dishwasher",
        iconStyle: "empty",
        points,
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer points", () => {
    expect(
      createChoreSchema.safeParse({
        name: "Dishes",
        iconName: "dishwasher",
        iconStyle: "empty",
        points: 2.5,
      }).success,
    ).toBe(false);
  });

  it.each(["washing_machine", "dishwasher", "garbage"])(
    "accepts legacy icon name %s",
    (iconName) => {
      expect(
        createChoreSchema.safeParse({
          name: "Test",
          iconName,
          iconStyle: "fill",
          points: 1,
        }).success,
      ).toBe(true);
    },
  );
});

describe("updateChoreSchema", () => {
  it("accepts valid input", () => {
    expect(
      updateChoreSchema.safeParse({
        choreId: 1,
        name: "Laundry",
        iconName: "washing-machine",
        iconStyle: "outline",
        points: 10,
      }).success,
    ).toBe(true);
  });

  it("rejects non-positive choreId", () => {
    expect(
      updateChoreSchema.safeParse({
        choreId: 0,
        name: "Laundry",
        iconName: "washing_machine",
        iconStyle: "fill",
        points: 10,
      }).success,
    ).toBe(false);
  });
});

describe("deleteChoreSchema", () => {
  it("accepts valid choreId", () => {
    expect(deleteChoreSchema.safeParse({ choreId: 1 }).success).toBe(true);
  });

  it("rejects missing choreId", () => {
    expect(deleteChoreSchema.safeParse({}).success).toBe(false);
  });
});
