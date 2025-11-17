import { describe, it, expect } from "vitest";
import { SMArea } from "@ricsam/selection-manager";
import {
  mapSmAreaToSourceRanges,
  areRowsConsecutive,
} from "./map_selections";

describe("mapSmAreaToSourceRanges", () => {
  it("should map simple contiguous selection with no sorting", () => {
    const area: SMArea = {
      start: { row: 0, col: 0 },
      end: { row: { type: "number", value: 2 }, col: { type: "number", value: 2 } },
    };

    // Identity mapping (no sorting/filtering)
    const visualToSourceRow = (r: number) => r;
    const visualToSourceCol = (c: number) => c;

    const result = mapSmAreaToSourceRanges(area, visualToSourceRow, visualToSourceCol, 10, 10);

    expect(result).toEqual([
      {
        start: { row: 0, col: 0 },
        end: { row: 2, col: 2 },
      },
    ]);
  });

  it("should handle single cell selection", () => {
    const area: SMArea = {
      start: { row: 5, col: 3 },
      end: { row: { type: "number", value: 5 }, col: { type: "number", value: 3 } },
    };

    const visualToSourceRow = (r: number) => r;
    const visualToSourceCol = (c: number) => c;

    const result = mapSmAreaToSourceRanges(area, visualToSourceRow, visualToSourceCol, 10, 10);

    expect(result).toEqual([
      {
        start: { row: 5, col: 3 },
        end: { row: 5, col: 3 },
      },
    ]);
  });

  it("should split non-contiguous rows after sorting", () => {
    const area: SMArea = {
      start: { row: 0, col: 0 },
      end: { row: { type: "number", value: 4 }, col: { type: "number", value: 0 } },
    };

    // Visual rows 0,1,2,3,4 map to source rows 10,2,3,4,12 (sorted with gaps)
    const rowMapping = [10, 2, 3, 4, 12];
    const visualToSourceRow = (r: number) => rowMapping[r];
    const visualToSourceCol = (c: number) => c;

    const result = mapSmAreaToSourceRanges(area, visualToSourceRow, visualToSourceCol, 20, 5);

    // Should create 3 separate ranges: row 2-4, row 10, row 12 (gaps between them)
    expect(result).toEqual([
      { start: { row: 2, col: 0 }, end: { row: 4, col: 0 } },
      { start: { row: 10, col: 0 }, end: { row: 10, col: 0 } },
      { start: { row: 12, col: 0 }, end: { row: 12, col: 0 } },
    ]);
  });

  it("should handle column reordering", () => {
    const area: SMArea = {
      start: { row: 0, col: 0 },
      end: { row: { type: "number", value: 0 }, col: { type: "number", value: 3 } },
    };

    const visualToSourceRow = (r: number) => r;
    // Visual columns 0,1,2,3 map to source columns 2,0,1,5 (reordered)
    const colMapping = [2, 0, 1, 5];
    const visualToSourceCol = (c: number) => colMapping[c];

    const result = mapSmAreaToSourceRanges(area, visualToSourceRow, visualToSourceCol, 10, 10);

    // Should create separate ranges for non-contiguous columns
    expect(result).toEqual([
      { start: { row: 0, col: 0 }, end: { row: 0, col: 2 } },
      { start: { row: 0, col: 5 }, end: { row: 0, col: 5 } },
    ]);
  });

  it("should handle infinity row range", () => {
    const area: SMArea = {
      start: { row: 0, col: 0 },
      end: { row: { type: "infinity" }, col: { type: "number", value: 0 } },
    };

    const visualToSourceRow = (r: number) => r;
    const visualToSourceCol = (c: number) => c;

    const result = mapSmAreaToSourceRanges(area, visualToSourceRow, visualToSourceCol, 5, 5);

    // Should cap at maxRows - 1 (4)
    expect(result).toEqual([
      { start: { row: 0, col: 0 }, end: { row: 4, col: 0 } },
    ]);
  });

  it("should handle infinity column range", () => {
    const area: SMArea = {
      start: { row: 0, col: 0 },
      end: { row: { type: "number", value: 0 }, col: { type: "infinity" } },
    };

    const visualToSourceRow = (r: number) => r;
    const visualToSourceCol = (c: number) => c;

    const result = mapSmAreaToSourceRanges(area, visualToSourceRow, visualToSourceCol, 5, 3);

    // Should cap at maxCols - 1 (2)
    expect(result).toEqual([
      { start: { row: 0, col: 0 }, end: { row: 0, col: 2 } },
    ]);
  });

  it("should handle both infinity row and column", () => {
    const area: SMArea = {
      start: { row: 0, col: 0 },
      end: {
        row: { type: "infinity" },
        col: { type: "infinity" },
      },
    };

    const visualToSourceRow = (r: number) => r;
    const visualToSourceCol = (c: number) => c;

    const result = mapSmAreaToSourceRanges(area, visualToSourceRow, visualToSourceCol, 3, 3);

    expect(result).toEqual([
      { start: { row: 0, col: 0 }, end: { row: 2, col: 2 } },
    ]);
  });

  it("should throw error when row mapping fails", () => {
    const area: SMArea = {
      start: { row: 0, col: 0 },
      end: { row: { type: "number", value: 2 }, col: { type: "number", value: 0 } },
    };

    const visualToSourceRow = (r: number) => {
      if (r === 1) throw new Error("Row not found");
      return r;
    };
    const visualToSourceCol = (c: number) => c;

    expect(() =>
      mapSmAreaToSourceRanges(area, visualToSourceRow, visualToSourceCol, 10, 10),
    ).toThrow("Row not found");
  });

  it("should throw error when column mapping fails", () => {
    const area: SMArea = {
      start: { row: 0, col: 0 },
      end: { row: { type: "number", value: 0 }, col: { type: "number", value: 2 } },
    };

    const visualToSourceRow = (r: number) => r;
    const visualToSourceCol = (c: number) => {
      if (c === 1) throw new Error("Column not found");
      return c;
    };

    expect(() =>
      mapSmAreaToSourceRanges(area, visualToSourceRow, visualToSourceCol, 10, 10),
    ).toThrow("Column not found");
  });

  it("should handle complex multi-row multi-column with mixed sorting", () => {
    const area: SMArea = {
      start: { row: 0, col: 0 },
      end: { row: { type: "number", value: 2 }, col: { type: "number", value: 1 } },
    };

    // Visual rows 0,1,2 map to source rows 5,3,4 (out of order but consecutive after sorting)
    const rowMapping = [5, 3, 4];
    const visualToSourceRow = (r: number) => rowMapping[r];
    const visualToSourceCol = (c: number) => c;

    const result = mapSmAreaToSourceRanges(area, visualToSourceRow, visualToSourceCol, 10, 5);

    // After sorting, rows 3,4,5 are consecutive
    expect(result).toEqual([
      { start: { row: 3, col: 0 }, end: { row: 5, col: 1 } },
    ]);
  });
});

describe("areRowsConsecutive", () => {
  it("should return true for consecutive source rows", () => {
    const area: SMArea = {
      start: { row: 0, col: 0 },
      end: { row: { type: "number", value: 4 }, col: { type: "number", value: 0 } },
    };

    // Visual rows 0-4 map to source rows 0-4 (consecutive)
    const visualToSourceRow = (r: number) => r;

    const result = areRowsConsecutive(area, visualToSourceRow, 10);
    expect(result).toBe(true);
  });

  it("should return true for consecutive source rows even when visually reordered", () => {
    const area: SMArea = {
      start: { row: 0, col: 0 },
      end: { row: { type: "number", value: 2 }, col: { type: "number", value: 0 } },
    };

    // Visual rows 0,1,2 map to source rows 5,3,4 (will be sorted to 3,4,5 - consecutive)
    const rowMapping = [5, 3, 4];
    const visualToSourceRow = (r: number) => rowMapping[r];

    const result = areRowsConsecutive(area, visualToSourceRow, 10);
    expect(result).toBe(true);
  });

  it("should return false for non-consecutive source rows", () => {
    const area: SMArea = {
      start: { row: 0, col: 0 },
      end: { row: { type: "number", value: 4 }, col: { type: "number", value: 0 } },
    };

    // Visual rows 0,1,2,3,4 map to source rows 10,2,3,4,11 (gaps: 2-4 is ok, but 10 and 11 create gaps)
    const rowMapping = [10, 2, 3, 4, 11];
    const visualToSourceRow = (r: number) => rowMapping[r];

    const result = areRowsConsecutive(area, visualToSourceRow, 20);
    expect(result).toBe(false);
  });

  it("should return true for single row", () => {
    const area: SMArea = {
      start: { row: 5, col: 0 },
      end: { row: { type: "number", value: 5 }, col: { type: "number", value: 0 } },
    };

    const visualToSourceRow = (r: number) => r * 2; // Maps to row 10

    const result = areRowsConsecutive(area, visualToSourceRow, 20);
    expect(result).toBe(true); // Single row is always consecutive
  });

  it("should handle infinity range by capping to maxRows", () => {
    const area: SMArea = {
      start: { row: 0, col: 0 },
      end: { row: { type: "infinity" }, col: { type: "number", value: 0 } },
    };

    const visualToSourceRow = (r: number) => r;

    const result = areRowsConsecutive(area, visualToSourceRow, 5);
    expect(result).toBe(true); // Rows 0-4 are consecutive
  });

  it("should return false for infinity range with gaps", () => {
    const area: SMArea = {
      start: { row: 0, col: 0 },
      end: { row: { type: "infinity" }, col: { type: "number", value: 0 } },
    };

    // Every other row (0,2,4,6,8)
    const visualToSourceRow = (r: number) => r * 2;

    const result = areRowsConsecutive(area, visualToSourceRow, 5);
    expect(result).toBe(false); // Rows 0,2,4,6,8 have gaps
  });
});

