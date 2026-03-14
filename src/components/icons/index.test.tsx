import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getChoreIcon } from "./index.tsx";

describe("Icon registry", () => {
  it.each(["washing_machine", "dishwasher", "garbage"] as const)(
    "returns both empty and fill variants for %s",
    (name) => {
      expect(getChoreIcon(name, "empty")).toBeTruthy();
      expect(getChoreIcon(name, "fill")).toBeTruthy();
    },
  );

  it("returns null for completely unknown icon", () => {
    expect(getChoreIcon("not-a-real-icon-xyz", "empty")).toBeNull();
  });

  it("renders a legacy icon from the registry", async () => {
    const result = getChoreIcon("dishwasher", "fill");
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.filled).toBe(false); // legacy icons bake fill into the component
    const screen = await render(<result.Icon size={48} />);
    const svg = screen.container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("width")).toBe("48");
  });

  it("resolves a Lucide icon by kebab-case name", () => {
    const result = getChoreIcon("washing-machine", "outline");
    expect(result).toBeTruthy();
    expect(result?.filled).toBe(false);
  });

  it("returns filled=true for Lucide icons with fill style", () => {
    const result = getChoreIcon("house", "fill");
    expect(result).toBeTruthy();
    expect(result?.filled).toBe(true);
  });

  it("returns filled=false for Lucide icons with outline style", () => {
    const result = getChoreIcon("house", "outline");
    expect(result).toBeTruthy();
    expect(result?.filled).toBe(false);
  });
});
