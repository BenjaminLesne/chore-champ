import { describe, expect, it } from "vitest";
import { tryCatch } from "./try-catch.ts";

describe("tryCatch", () => {
  it("returns data on success", async () => {
    const result = await tryCatch(Promise.resolve("hello"));
    expect(result).toEqual({ data: "hello", error: null });
  });

  it("returns error on failure", async () => {
    const error = new Error("fail");
    const result = await tryCatch(Promise.reject(error));
    expect(result).toEqual({ data: null, error });
  });
});
