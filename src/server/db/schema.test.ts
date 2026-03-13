import assert from "node:assert";
import { describe, it } from "node:test";

import {
  households,
  members,
  adminAccounts,
  chores,
  choreLogs,
} from "./schema";

void describe("schema exports", () => {
  void it("exports all required tables", () => {
    assert.ok(households);
    assert.ok(members);
    assert.ok(adminAccounts);
    assert.ok(chores);
    assert.ok(choreLogs);
  });
});
