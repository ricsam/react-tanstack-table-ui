import { describe, expect, it } from "bun:test";
import {
  calculateDisplacement,
  Row,
  WindowRange,
} from "./calculate_displacement";

// Create 20 rows each with size=32, IDs "row-1"..."row-20", and index 0..19
const rows = Array.from({ length: 20 }, (_, i) => ({
  index: i,
  size: 32,
  id: `row-${i + 1}`,
  start: i * 32,
}));

describe("can move two down", () => {
  // Instead of draggingIndexes, define 'selected' with IDs
  const selected = [rows[0], rows[2]];
  // Instead of thisIndex, use 'id' for the row whose displacement we check
  const id = "row-4";

  it("should work with indexDiff 0", () => {
    const displacement = calculateDisplacement(rows, selected, 0);
    expect(displacement[id] ?? 0).toBe(0);
  });

  it("should work with indexDiff 1", () => {
    const displacement = calculateDisplacement(rows, selected, 1);
    expect(displacement[id] ?? 0).toBe(-32);
  });

  it("should work with indexDiff 2", () => {
    const displacement = calculateDisplacement(rows, selected, 2);
    expect(displacement[id] ?? 0).toBe(-64);
  });
});

describe("can move one up", () => {
  const selected = [rows[1]];

  it("should work with indexDiff -1", () => {
    const displacement = calculateDisplacement(rows, selected, -1);
    expect(displacement["row-2"]).toBe(-32);
    expect(displacement["row-1"]).toBe(32);
  });
});

describe("can move two up", () => {
  const selected = [rows[2], rows[4]];
  const id = "row-2";

  it("should work with indexDiff 0", () => {
    const displacement = calculateDisplacement(rows, selected, 0);
    expect(displacement[id] ?? 0).toBe(0);
  });

  it("should work with indexDiff -1", () => {
    const displacement = calculateDisplacement(rows, selected, -1);
    expect(displacement[id] ?? 0).toBe(32);
  });

  it("should work with indexDiff -2", () => {
    const displacement = calculateDisplacement(rows, selected, -2);
    expect(displacement[id] ?? 0).toBe(64);
  });
});

describe("can move into a gap", () => {
  const selected = [rows[1], rows[3], rows[4]];
  const id = "row-7";

  it("should work with indexDiff 0", () => {
    const displacement = calculateDisplacement(rows, selected, 0);
    expect(displacement[id] ?? 0).toBe(0);
  });

  it("should work with indexDiff 1", () => {
    const displacement = calculateDisplacement(rows, selected, 1);
    expect(displacement[id] ?? 0).toBe(0);
  });

  it("should work with indexDiff 2", () => {
    const displacement = calculateDisplacement(rows, selected, 2);
    expect(displacement[id] ?? 0).toBe(-64);
  });
});

describe("basic example", () => {
  const rows: Row[] = [
    { index: 0, size: 10, id: "a", start: 0 },
    { index: 1, size: 20, id: "b", start: 10 },
    { index: 2, size: 30, id: "c", start: 20 },
    { index: 3, size: 40, id: "d", start: 50 },
    { index: 4, size: 50, id: "e", start: 90 },
  ];

  /**
   * Example 1:
   * Dragging "b" down over "c" by delta=1.
   * - `b` moves from index 1 to index 2
   * - `b` passes over `c`, so:
   *   - `c` is displaced by -b.size = -20
   *   - `b` is displaced by +c.size = +30
   * - a, d, e remain unaffected = 0
   */
  describe("Dragging b over c", () => {
    it("should displace b and c correctly", () => {
      const selected = [rows[1]];
      const delta = 1;
      const displacement = calculateDisplacement(rows, selected, delta);

      expect(displacement["a"]).toBe(0);
      expect(displacement["b"]).toBe(30); // b is displaced by c.size
      expect(displacement["c"]).toBe(-20); // c is displaced by -b.size
      expect(displacement["d"]).toBe(0);
      expect(displacement["e"]).toBe(0);
    });
  });

  /**
   * Example 2:
   * Moving b and d together upwards by delta=-1.
   * - `b` goes from index=1 to index=0, passing over `a`:
   *   - `a` gets displaced by +b.size = +20
   *   - `b` gets displaced by +a.size = +10
   * - `d` goes from index=3 to index=2, passing over `c`:
   *   - `c` gets displaced by +d.size = +40
   *   - `d` gets displaced by +c.size = +30
   * - `e` remains unaffected = 0
   */
  describe("Moving b and d up by delta=-1", () => {
    it("should displace a, c, b, and d correctly", () => {
      const selected = [rows[1], rows[3]];
      const delta = -1;
      const displacement = calculateDisplacement(rows, selected, delta);

      expect(displacement["a"]).toBe(20); // +b.size
      expect(displacement["b"]).toBe(-10); // -a.size
      expect(displacement["c"]).toBe(40); // +d.size
      expect(displacement["d"]).toBe(-30); // -c.size
      expect(displacement["e"]).toBe(0);
    });
  });
});

describe("can work with range", () => {
  const getRange = (start: number, end: number, selected: number[]) => {
    const range: WindowRange = {
      index: [start, end],
      start: [rows[start].start, rows[end].start + rows[end].size],
    };
    return {
      range,
      rows: rows.slice(range.index[0], range.index[1] + 1),
      selected: selected.map((i) => rows[i]),
    };
  };
  it("should move a single item down", () => {
    const { range, rows, selected } = getRange(2, 5, [0]);
    const displacement = calculateDisplacement(rows, selected, 4, range);

    expect(displacement["row-1"]).toBe(4 * 32);
    expect(displacement["row-2"]).toBe(undefined!);
    expect(displacement["row-3"]).toBe(-32);
    expect(displacement["row-4"]).toBe(-32);
    expect(displacement["row-5"]).toBe(-32);
    expect(displacement["row-6"]).toBe(0);
    expect(displacement["row-7"]).toBe(undefined!);
  });
  it("should move a two items down", () => {
    const { range, rows, selected } = getRange(4, 9, [0, 2]);
    const displacement = calculateDisplacement(rows, selected, 4, range);

    expect(displacement["row-1"]).toBe(4 * 32);
    expect(displacement["row-2"]).toBe(undefined!);
    expect(displacement["row-3"]).toBe(4 * 32);
    expect(displacement["row-4"]).toBe(undefined!);
    expect(displacement["row-5"]).toBe(-64);
    // expect(displacement["row-6"]).toBe(-64);
    expect(displacement["row-7"]).toBe(-32);
    expect(displacement["row-8"]).toBe(0);
  });
  it("should move a two items down", () => {
    const { range, rows, selected } = getRange(4, 9, [0, 2]);
    const displacement = calculateDisplacement(rows, selected, 6, range);

    expect(displacement["row-1"]).toBe(6 * 32);
    expect(displacement["row-2"]).toBe(undefined!);
    expect(displacement["row-3"]).toBe(6 * 32);
    expect(displacement["row-4"]).toBe(undefined!);
    expect(displacement["row-5"]).toBe(-64);
    expect(displacement["row-6"]).toBe(-64);
    // expect(displacement["row-6"]).toBe(0);
    // expect(displacement["row-7"]).toBe(undefined!);
  });
});
