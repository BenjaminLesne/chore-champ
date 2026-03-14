import { describe, expect, it } from "vitest";
import { getChoreIcon } from "./index.tsx";

describe("Icon registry", () => {
  it.each(["washing_machine", "dishwasher", "garbage"] as const)(
    "returns both empty and fill variants for %s",
    (name) => {
      expect(getChoreIcon(name, "empty")).toBeTruthy();
      expect(getChoreIcon(name, "fill")).toBeTruthy();
    },
  );

  it("returns null for unknown icon_name", () => {
    expect(getChoreIcon("unknown", "empty")).toBeNull();
  });
});
