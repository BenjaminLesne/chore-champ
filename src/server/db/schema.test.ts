import { describe, expect, it } from "vitest";
import {
  households,
  members,
  adminAccounts,
  chores,
  choreLogs,
} from "./schema.ts";

describe("schema exports", () => {
  it("exports all required tables", () => {
    expect(households).toBeDefined();
    expect(members).toBeDefined();
    expect(adminAccounts).toBeDefined();
    expect(chores).toBeDefined();
    expect(choreLogs).toBeDefined();
  });
});
