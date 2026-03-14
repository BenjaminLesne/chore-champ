import { describe, expect, it } from "vitest";
import { ICON_NAMES, getLucideIcon } from "./lucide.ts";

describe("Lucide icon utility", () => {
  it("exports a non-empty sorted list of icon names", () => {
    expect(ICON_NAMES.length).toBeGreaterThan(100);
    const sorted = [...ICON_NAMES].sort();
    expect(ICON_NAMES).toEqual(sorted);
  });

  it("names are kebab-case", () => {
    for (const name of ICON_NAMES) {
      expect(name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("getLucideIcon returns a component for a known icon", () => {
    const icon = getLucideIcon("washing-machine");
    expect(icon).toBeTruthy();
    expect(typeof icon).toBe("object"); // forwardRef component
  });

  it("getLucideIcon returns null for unknown name", () => {
    expect(getLucideIcon("not-a-real-icon-xyz")).toBeNull();
  });

  it("contains well-known icons", () => {
    expect(getLucideIcon("house")).toBeTruthy();
    expect(getLucideIcon("search")).toBeTruthy();
    expect(getLucideIcon("trash2")).toBeTruthy();
  });
});
