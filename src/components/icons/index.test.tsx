import { describe, it } from "node:test";
import assert from "node:assert";

void describe("Icon registry", () => {
  void it("exports getChoreIcon function", async () => {
    const mod = await import("./index.tsx");
    assert.ok(typeof mod.getChoreIcon === "function");
  });

  void it("returns correct component for each icon_name + icon_style", async () => {
    const { getChoreIcon } = await import("./index.tsx");
    const names = ["washing_machine", "dishwasher", "garbage"] as const;
    const styles = ["empty", "fill"] as const;

    for (const name of names) {
      for (const style of styles) {
        const Icon = getChoreIcon(name, style);
        assert.ok(Icon, `Missing icon for ${name} + ${style}`);
      }
    }
  });

  void it("returns null for unknown icon_name", async () => {
    const { getChoreIcon } = await import("./index.tsx");
    const Icon = getChoreIcon("unknown", "empty");
    assert.strictEqual(Icon, null);
  });
});
