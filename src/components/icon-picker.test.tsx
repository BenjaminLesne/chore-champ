import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { IconPicker } from "./icon-picker.tsx";

describe("IconPicker", () => {
  it("renders a trigger button", async () => {
    const screen = await render(<IconPicker name="iconName" />);
    await expect
      .element(screen.getByRole("button", { name: /pick an icon/i }))
      .toBeVisible();
  });

  it("renders with a default value", async () => {
    const screen = await render(
      <IconPicker name="iconName" defaultValue="house" />,
    );
    await expect
      .element(screen.getByRole("button", { name: /icon: house/i }))
      .toBeVisible();
    const hidden = screen.container.querySelector('input[name="iconName"]');
    expect(hidden).toBeTruthy();
    expect(hidden?.getAttribute("value")).toBe("house");
  });

  it("includes hidden inputs for icon name and style", async () => {
    const screen = await render(
      <IconPicker name="myIcon" defaultValue="star" />,
    );
    const nameInput = screen.container.querySelector('input[name="myIcon"]');
    expect(nameInput).toBeTruthy();
    expect(nameInput?.getAttribute("value")).toBe("star");

    const styleInput = screen.container.querySelector(
      'input[name="iconStyle"]',
    );
    expect(styleInput).toBeTruthy();
    expect(styleInput?.getAttribute("value")).toBe("outline");
  });

  it("uses custom styleName prop", async () => {
    const screen = await render(
      <IconPicker
        name="iconName"
        styleName="myStyle"
        defaultValue="star"
        defaultStyle="fill"
      />,
    );
    const styleInput = screen.container.querySelector('input[name="myStyle"]');
    expect(styleInput).toBeTruthy();
    expect(styleInput?.getAttribute("value")).toBe("fill");
  });

  it("renders a fill/outline toggle", async () => {
    const screen = await render(
      <IconPicker name="iconName" defaultValue="house" />,
    );
    await expect
      .element(screen.getByRole("button", { name: /switch to fill/i }))
      .toBeVisible();
  });
});
