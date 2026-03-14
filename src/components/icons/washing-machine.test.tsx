import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { WashingMachineEmpty, WashingMachineFill } from "./washing-machine.tsx";

describe("WashingMachine icons", () => {
  it("renders WashingMachineEmpty as an SVG", async () => {
    const screen = await render(<WashingMachineEmpty />);
    const svg = screen.container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("renders WashingMachineFill as an SVG", async () => {
    const screen = await render(<WashingMachineFill />);
    const svg = screen.container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("applies custom size", async () => {
    const screen = await render(<WashingMachineFill size={64} />);
    const svg = screen.container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("64");
    expect(svg?.getAttribute("height")).toBe("64");
  });
});
