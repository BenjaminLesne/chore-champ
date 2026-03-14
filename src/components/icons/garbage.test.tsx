import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { GarbageEmpty, GarbageFill } from "./garbage.tsx";

describe("Garbage icons", () => {
  it("renders GarbageEmpty as an SVG", async () => {
    const screen = await render(<GarbageEmpty />);
    const svg = screen.container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("renders GarbageFill as an SVG", async () => {
    const screen = await render(<GarbageFill />);
    const svg = screen.container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("applies custom size", async () => {
    const screen = await render(<GarbageEmpty size={32} />);
    const svg = screen.container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("32");
    expect(svg?.getAttribute("height")).toBe("32");
  });
});
