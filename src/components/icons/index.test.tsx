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

  it("returns null for unknown icon_name", () => {
    expect(getChoreIcon("unknown", "empty")).toBeNull();
  });

  it("renders an icon from the registry", async () => {
    const Icon = getChoreIcon("dishwasher", "fill");
    expect(Icon).not.toBeNull();
    if (!Icon) return;
    const screen = await render(<Icon size={48} />);
    const svg = screen.container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("width")).toBe("48");
  });
});
