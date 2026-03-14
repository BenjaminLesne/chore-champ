import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { DishwasherEmpty, DishwasherFill } from "./dishwasher.tsx";

describe("Dishwasher icons", () => {
  it("renders DishwasherEmpty as an SVG", async () => {
    const screen = await render(<DishwasherEmpty />);
    const svg = screen.container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("renders DishwasherFill as an SVG", async () => {
    const screen = await render(<DishwasherFill />);
    const svg = screen.container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("applies custom size", async () => {
    const screen = await render(<DishwasherEmpty size={24} />);
    const svg = screen.container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("24");
    expect(svg?.getAttribute("height")).toBe("24");
  });
});
