import { describe, expect, it } from "bun:test";
import { calculateDisplacement } from "./calculate_displacement";

// Create 20 rows each with size=32, IDs "row-0"..."row-19", and index 0..19
const rows = Array.from({ length: 20 }, (_, i) => ({
  index: i,
  size: 32,
  id: `row-${i}`,
}));

describe("can move two down", () => {
  // Instead of draggingIndexes, define 'selected' with IDs
  const selected = [
    { index: 0, size: 32, id: "row-0" },
    { index: 2, size: 32, id: "row-2" },
  ];
  // Instead of thisIndex, use 'id' for the row whose displacement we check
  const id = "row-3";

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

describe("can move two up", () => {
  const selected = [
    { index: 2, size: 32, id: "row-2" },
    { index: 4, size: 32, id: "row-4" },
  ];
  const id = "row-1";

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
  const selected = [
    { index: 1, size: 32, id: "row-1" },
    { index: 3, size: 32, id: "row-3" },
    { index: 4, size: 32, id: "row-4" },
  ];
  const id = "row-6";

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
  const rows = [
    { index: 0, size: 10, id: "a" },
    { index: 1, size: 20, id: "b" },
    { index: 2, size: 30, id: "c" },
    { index: 3, size: 40, id: "d" },
    { index: 4, size: 50, id: "e" },
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
      const selected = [{ index: 1, size: 20, id: "b" }];
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
      const selected = [
        { index: 1, size: 20, id: "b" },
        { index: 3, size: 40, id: "d" },
      ];
      const delta = -1;
      const displacement = calculateDisplacement(rows, selected, delta);

      expect(displacement["a"]).toBe(20); // +b.size
      expect(displacement["b"]).toBe(10); // +a.size
      expect(displacement["c"]).toBe(40); // +d.size
      expect(displacement["d"]).toBe(30); // +c.size
      expect(displacement["e"]).toBe(0);
    });
  });
});
