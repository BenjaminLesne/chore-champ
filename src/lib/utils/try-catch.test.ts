import { describe, it } from "node:test";
import assert from "node:assert";
import { tryCatch } from "./try-catch.ts";

void describe("tryCatch", () => {
  void it("returns data on success", async () => {
    const result = await tryCatch(Promise.resolve("hello"));
    assert.deepStrictEqual(result, { data: "hello", error: null });
  });

  void it("returns error on failure", async () => {
    const error = new Error("fail");
    const result = await tryCatch(Promise.reject(error));
    assert.deepStrictEqual(result, { data: null, error });
  });
});
