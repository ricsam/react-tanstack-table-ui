import { describe, it, expect } from "vitest";
import { ReactTanstackTableUi, useRowContext } from "@rttui/core";

describe("can import", () => {
  it("should be able to import rttui/core", () => {
    expect(ReactTanstackTableUi).toBeDefined();
  });

  it("should be able to import rttui/core", () => {
    expect(useRowContext).toBeDefined();
  });
});
