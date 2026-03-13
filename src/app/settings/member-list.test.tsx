import { describe, it } from "node:test";
import assert from "node:assert/strict";

void describe("MemberList", () => {
  void it("exports MemberList component", async () => {
    const mod = await import("./member-list.tsx");
    assert.equal(typeof mod.MemberList, "function");
  });
});
