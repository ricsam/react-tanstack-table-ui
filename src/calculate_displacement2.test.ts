import { describe, it, expect } from "bun:test";
import { Item, calculateDisplacements, deltaScanRange } from "./Item";

// ─────────────────────────────────────────────────────────────────────────────
// 1) Helpers for Our Standard 8 Items (Indices 0..7):
//    0:a, 1:b, 2:c, 3:d, 4:e, 5:f, 6:g, 7:h
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All 8 items, each with size=1 (the "classic" scenario).
 */
function getAllItemsSize(): Item[] {
  return [
    { index: 0, id: "a", start: 0, size: 1 },
    { index: 1, id: "b", start: 1, size: 1 },
    { index: 2, id: "c", start: 2, size: 1 },
    { index: 3, id: "d", start: 3, size: 1 },
    { index: 4, id: "e", start: 4, size: 1 },
    { index: 5, id: "f", start: 5, size: 1 },
    { index: 6, id: "g", start: 6, size: 1 },
    { index: 7, id: "h", start: 7, size: 1 },
  ];
}

/**
 * Items in the "window" range [2..5] => c, d, e, f.
 */
function getInRangeItemsSize1(all: Item[]): Item[] {
  return all.filter((item) => item.index >= 2 && item.index <= 5);
}

describe("calculateDisplacements", () => {
  it("Should move a single item down", () => {
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     *    , b, |c, d, e, f|, g, h
     *   b, c, |d, e, f, g|, h,
     *   b, c, |d, a, e, f|, g, h
     * Delta: 3
     * selected = [a]
     * After Movement:
     *   b, c, |d, a, e, f|, g, h
     * Displacements:
     *   a: +3, c: -1, d: -1, e: 0, f: 0
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    const selected = all.filter((i) => i.id === "a");
    const delta = 3;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ a: 3, c: -1, d: -1, e: 0, f: 0 });
  });

  it("Should move 2 items down", () => {
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     *    , b, | , d, e, f|, g, h
     *   b, d, |e, f, g, h|,  ,
     *   b, d, |e, a, f, c|, g, h
     * Delta: 3
     * selected = [a, c]
     * After Movement:
     *   b, d, |e, a, f, c|, g, h
     * Displacements:
     *   a: +3, c: +3, d: -2, e: -2, f: -1
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    const selected = all.filter((i) => ["a", "c"].includes(i.id));
    const delta = 3;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ a: 3, c: 3, d: -2, e: -2, f: -1 });
  });

  it("Should move 3 items down", () => {
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     *    , b, | ,  , e, f|, g, h
     *   b, e, |f, g, h,  |,  ,
     *   b, e, |a, f, c, d|, g, h
     * Delta: 2
     * selected = [a, c, d]
     * After Movement:
     *   b, e, |a, f, c, d|, g, h
     * Displacements:
     *   a: +2, c: +2, d: 2, e: -3, f: -2
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    const selected = all.filter((i) => ["a", "c", "d"].includes(i.id));
    const delta = 2;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ a: 2, c: 2, d: 2, e: -3, f: -2 });
  });

  it("Should move a single item up", () => {
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     * Delta: -4
     * selected = [h]
     * After Movement:
     *   a, b, |c, h, d, e|, f, g
     * Displacements:
     *   h: -4, c: 0, d: +1, e: +1, f: +1
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    const selected = all.filter((i) => i.id === "h");
    const delta = -4;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ h: -4, c: 0, d: 1, e: 1, f: 1 });
  });

  it("Should move a single item down within the window", () => {
    /**
     * c => +2, d => -1, e => -1, f => 0
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    const selected = all.filter((i) => i.id === "c");
    const delta = 2;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ c: 2, d: -1, e: -1, f: 0 });
  });

  it("Should move a single item up within the window", () => {
    /**
     * e => -2, c => +1, d => +1, f => 0
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    const selected = all.filter((i) => i.id === "e");
    const delta = -2;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ e: -2, c: 1, d: 1, f: 0 });
  });

  it("Should move multiple items down within the window", () => {
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     * Delta: 2
     * selected = [c, d]
     * After Movement:
     *   a, b, |e, f, c, d|, g, h
     * Displacements:
     *   c: +2, d: +2, e: -2, f: -2
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    const selected = all.filter((i) => ["c", "d"].includes(i.id));
    const delta = 2;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ c: 2, d: 2, e: -2, f: -2 });
  });

  it("Should move multiple items up within the window", () => {
    /**
     * d => -1, e => -1, c => +2, f => 0
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    const selected = all.filter((i) => ["d", "e"].includes(i.id));
    const delta = -1;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ d: -1, e: -1, c: 2, f: 0 });
  });

  it("Should move multiple items down where one item is in the window", () => {
    /**
     * b => +3, c => +3, d => -2, e => -2, f => -2
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    const selected = all.filter((i) => ["b", "c"].includes(i.id));
    const delta = 3;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ b: 3, c: 3, d: -2, e: -2, f: -2 });
  });

  it("Should move multiple items up where one item is in the window", () => {
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     *   a, b, |c, d,  , f|,  , h
     *   a, b, |c, d, f, h|,  ,
     *   a, b, |e, c, g, d|, f, h
     * Delta: -2
     * selected = [e, g]
     * After Movement:
     *   a, b, |e, c, g, d|, f, h
     * Displacements:
     *   c: 1, d: 2, e: -2, f: 1, g: -2
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    const selected = all.filter((i) => ["e", "g"].includes(i.id));
    const delta = -2;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ c: 1, d: 2, e: -2, f: 1, g: -2 });
  });

  it("Should move multiple items up where one item is in the window and the other one will never enter", () => {
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     *   a, b, |c, d,  , f|, g,
     *   a, b, |c, d, f, g|,  ,
     *   a, b, |c, e, d, f|, h, g
     * Delta: -1
     * selected = [e, h]
     * After Movement:
     *   a, b, |e, c, g, d|, f, h
     * Displacements:
     *   c: 0, d: 1, e: -1, f: 0, h: -1
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    const selected = all.filter((i) => ["e", "h"].includes(i.id));
    const delta = -1;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ c: 0, d: 1, e: -1, f: 0, h: -1 });
  });

  it("Should move a single item from within the window up out of it", () => {
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     *   a, b, |d, e, f, g|, h,
     *   c, a, |b, d, e, f|, g, h
     * Delta: -2
     * selected = [c]
     * After Movement:
     *   c, a, |b, d, e, f|, g, h
     * Displacements:
     *   a: +1, b: +1, c: -2, d: 0, e: 0, f: 0
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    // "c" is inside the window
    const selected = all.filter((i) => i.id === "c");
    const delta = -2;

    // Example expectation (modify to match your actual logic)
    const result = calculateDisplacements(inRange, selected, delta);

    expect(result.displacements).toEqual({
      c: -1, // move it out of the window
      d: 0,
      e: 0,
      f: 0,
    });
  });

  it("Should move a single item from within the window down out of it", () => {
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     *   a, b, |c, d, e,  |, g, h
     *   a, b, |c, d, e, g|, h,
     *   a, b, |c, d, e, g|, h, f
     * Suppose we select "f" (index=5, in the window)
     * and move it "down" with delta=2, pushing it out to index=6 or so.
     *
     * Example After Movement:
     *   a, b, |c, d, e, g|, h, f
     *
     * Expected Displacements, which moves f out of the window:
     *   f: +1
     *   c:  0
     *   d:  0
     *   e:  0
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    // "f" is inside the window
    const selected = all.filter((i) => i.id === "f");
    const delta = 2;

    // Example expectation (adjust as needed)
    const result = calculateDisplacements(inRange, selected, delta);

    expect(result.displacements).toEqual({
      f: 1,
      c: 0,
      d: 0,
      e: 0,
    });
  });
});

/**
 * Example of items with varying sizes:
 *   a(1px), b(2px), c(3px), d(1px), e(2px), f(4px), g(1px), h(2px)
 *   (Positions remain index-based for simplicity, but you might change those.)
 */
function getAllItemsVaryingSizes(): Item[] {
  return [
    { index: 0, id: "a", start: 0, size: 1 },
    { index: 1, id: "b", start: 1, size: 2 },
    { index: 2, id: "c", start: 3, size: 3 },
    { index: 3, id: "d", start: 6, size: 1 },
    { index: 4, id: "e", start: 7, size: 2 },
    { index: 5, id: "f", start: 9, size: 4 },
    { index: 6, id: "g", start: 13, size: 1 },
    { index: 7, id: "h", start: 14, size: 2 },
  ];
}

// Window [2..5] => c, d, e, f (but note their sizes: 3, 1, 2, 4).
function getInRangeItemsVaryingSizes(all: Item[]): Item[] {
  return all.filter((item) => item.index >= 2 && item.index <= 5);
}

describe("calculateDisplacements with different item sizes", () => {
  it("Should move a single item down (sizes vary)", () => {
    /**
     * Before Movement (still conceptually):
     *   a(1px), b(2px), |c(3px), d(1px), e(2px), f(4px)|, g(1px), h(2px)
     *
     * Delta: 3
     * selected = [a]
     *
     * Because "a" is 1px, etc. the actual logic might shift c, d, e, f
     * differently. The final expectation depends on your size logic.
     *
     * Example placeholder result => { a: 6, c: -1, d: -1, e: 0, f: 0 }
     * (You MUST adapt to your real size calculations.)
     */
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     * Delta: 4
     * selected = [a]
     * After Movement:
     *   b, c, |d, a, e, f|, g, h
     * Displacements:
     *   a: +6, c: -1, d: -1, e: 0, f: 0
     */
    const all = getAllItemsVaryingSizes();
    const inRange = getInRangeItemsVaryingSizes(all);
    const selected = all.filter((i) => i.id === "a");
    const delta = 3;

    // Placeholder expectation—likely different in your real logic:
    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ a: 6, c: -1, d: -1, e: 0, f: 0 });
  });

  it("Should move multiple items down (sizes vary)", () => {
    /**
     * selected = [a, c]
     * delta = 3
     * e.g. { a:4, c:4, d:-2, e:-2, f:-1 } or something else
     */

    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     *    , b, | , d, e, f|, g, h
     *   b, d, |e, f, g, h|,  ,
     *   b, d, |e, a, f, c|, g, h
     * Delta: 3
     * selected = [a, c]
     * After Movement:
     *   b, d, |e, a, f, c|, g, h
     * Displacements:
     *   a: +5, c: +3, d: -2, e: -2, f: -1
     */
    // a is displaced by b,d,e = 5
    // c has startPos a,b = 3 initially and will have a,b,d,e,f = 10 after the move
    // d has startPos abc = 6 initially and will have b = 2 after the move
    // e has startPos abcd = 7 initially and will have bd = 3 after the move
    // f has startPos abcde = 9 initially and will have bdea = 6 after the move

    const all = getAllItemsVaryingSizes();
    const inRange = getInRangeItemsVaryingSizes(all);
    const selected = all.filter((i) => ["a", "c"].includes(i.id));
    const delta = 3;

    // Placeholder
    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ a: 5, c: 7, d: -4, e: -4, f: -3 });
  });

  it("Should move a single item up (sizes vary)", () => {
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     *   a, b, |c, d, e, f|, g,
     *   a, b, |c, h, d, e|, f, g
     * Delta: -4
     * selected = [h]
     * After Movement:
     *   a, b, |c, h, d, e|, f, g
     * Displacements:
     *   h: -8, c: 0, d: +2, e: +2, f: +2
     */
    // before movement h is at startPos 14
    // after movement h will be at startPos 6
    // before: d.start -> 6
    // after: d.start -> 8
    // before: e.start -> 7
    // after: e.start -> 9

    const all = getAllItemsVaryingSizes();
    const inRange = getInRangeItemsVaryingSizes(all);
    const selected = all.filter((i) => i.id === "h");
    const delta = -4;

    // Placeholder
    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ h: -8, c: 0, d: 2, e: 2, f: 2 });
  });

  it("Should move a single item down within the window (sizes vary)", () => {
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     *   a, b, | , d, e, f|, g, h
     *   a, b, |d, e, f, g|, h,
     *   a, b, |d, e, c, f|, g, h
     * Delta: 2
     * selected = [c]
     * After Movement:
     *   a, b, |d, e, c, f|, g, h
     * Displacements:
     *   c: 3, d: -3, e: -3, f: 0
     */
    // before: c.start = 3
    // after: c.start = 6
    // before: d.start = 6
    // after: d.start = 3
    // before: e.start = 7
    // after: e.start = 4
    // before: f.start = 9
    // after: f.start = 9

    const all = getAllItemsVaryingSizes();
    const inRange = getInRangeItemsVaryingSizes(all);
    const selected = all.filter((i) => i.id === "c");
    const delta = 2;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ c: 3, d: -3, e: -3, f: 0 });
  });

  it("Should move a single item up within the window (sizes vary)", () => {
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     *   a, b, |c, d,  , f|, g, h
     *   a, b, |c, d, f, g|, h,
     *   a, b, |e, c, d, f|, g, h
     * Delta: -2
     * selected = [e]
     * After Movement:
     *   a, b, |e, c, d, f|, g, h
     * Displacements:
     *   c: 2, d: 2, e: -4, f: 0
     */
    // before: c.start = 3
    // after: c.start = 5
    // before: d.start = 6
    // after: d.start = 8
    // before: e.start = 7
    // after: e.start = 3
    // before: f.start = 9
    // after: f.start = 9
    const all = getAllItemsVaryingSizes();
    const inRange = getInRangeItemsVaryingSizes(all);
    const selected = all.filter((i) => i.id === "e");
    const delta = -2;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ c: 2, d: 2, e: -4, f: 0 });
  });

  it("Should move multiple items down within the window (sizes vary)", () => {
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     *   a, b, | ,  , e, f|, g, h
     *   a, b, |e, f, g, h|,  ,
     *   a, b, |e, f, c, d|, g, h
     * Delta: 2
     * selected = [c, d]
     * After Movement:
     *   a, b, |e, f, c, d|, g, h
     * Displacements:
     *   c: 6, d: 6, e: -4, f: -4
     */
    // before: c.start = 3
    // after: c.start = 9
    // before: d.start = 6
    // after: d.start = 12
    // before: e.start = 7
    // after: e.start = 3
    // before: f.start = 9
    // after: f.start = 5
    const all = getAllItemsVaryingSizes();
    const inRange = getInRangeItemsVaryingSizes(all);
    const selected = all.filter((i) => ["c", "d"].includes(i.id));
    const delta = 2;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ c: 6, d: 6, e: -4, f: -4 });
  });

  it("Should move multiple items up within the window (sizes vary)", () => {
    /**
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     *   a, b, |c,  ,  , f|, g, h
     *   a, b, |c, f, g, h|,  ,
     *   a, b, |d, e, c, f|, g, h
     * Delta: -1
     * selected = [d, e]
     * After Movement:
     *   a, b, |d, e, c, f|, g, h
     * Displacements:
     *   c: 3, d: -3, e: -3, f: 0
     */
    // before: c.start = 3
    // after: c.start = 6
    // before: d.start = 6
    // after: d.start = 3
    // before: e.start = 7
    // after: e.start = 4
    // before: f.start = 9
    // after: f.start = 9
    const all = getAllItemsVaryingSizes();
    const inRange = getInRangeItemsVaryingSizes(all);
    const selected = all.filter((i) => ["d", "e"].includes(i.id));
    const delta = -1;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ c: 3, d: -3, e: -3, f: 0 });
  });

  it("Should move multiple items down, one in window (sizes vary)", () => {
    // { index: 0, id: "a", start: 0, size: 1 },
    // { index: 1, id: "b", start: 1, size: 2 },
    // { index: 2, id: "c", start: 3, size: 3 },
    // { index: 3, id: "d", start: 6, size: 1 },
    // { index: 4, id: "e", start: 7, size: 2 },
    // { index: 5, id: "f", start: 9, size: 4 },
    // { index: 6, id: "g", start: 13, size: 1 },
    // { index: 7, id: "h", start: 14, size: 2 },

    /**
     * Movement:
     *   a, b, |c, d, e, f|, g, h
     *   a,  , | , d, e, f|, g, h
     *   a, d, |e, f, g, h|,  ,
     *   a, d, |e, f, b, c|, g, h
     * Delta: 3
     * selected = [b, c]
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     * After Movement:
     *   a, d, |e, f, b, c|, g, h
     * Displacements:
     *   b: 7, c: 7, d: -5, e: -5, f: -5
     */
    // before: c.start = 3
    // after: c.start = 10
    // before: d.start = 6
    // after: d.start = 1
    // before: e.start = 7
    // after: e.start = 2
    // before: f.start = 9
    // after: f.start = 4
    // before: b.start = 1
    // after: b.start = 8

    const all = getAllItemsVaryingSizes();
    const inRange = getInRangeItemsVaryingSizes(all);
    const selected = all.filter((i) => ["b", "c"].includes(i.id));
    const delta = 3;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ b: 7, c: 7, d: -5, e: -5, f: -5 });
  });

  it("Should move multiple items up, one in window (sizes vary)", () => {
    // { index: 0, id: "a", start: 0, size: 1 },
    // { index: 1, id: "b", start: 1, size: 2 },
    // { index: 2, id: "c", start: 3, size: 3 },
    // { index: 3, id: "d", start: 6, size: 1 },
    // { index: 4, id: "e", start: 7, size: 2 },
    // { index: 5, id: "f", start: 9, size: 4 },
    // { index: 6, id: "g", start: 13, size: 1 },
    // { index: 7, id: "h", start: 14, size: 2 },

    /**
     * Movement:
     *   a, b, |c, d, e, f|, g, h
     *   a, b, |c, d,  , f|,  , h
     *   a, b, |c, d, f, h|,  ,
     *   a, b, |e, c, g, d|, f, h
     * Delta: -2
     * selected = [e, g]
     * Before Movement:
     *   a, b, |c, d, e, f|, g, h
     * After Movement:
     *   a, b, |e, c, g, d|, f, h
     * Displacements:
     *   g: -5, c: 2, d: 3, e: -4, f: 1
     */
    // before: c.start = 3
    // after: c.start = 5
    // before: d.start = 6
    // after: d.start = 9
    // before: e.start = 7
    // after: e.start = 3
    // before: f.start = 9
    // after: f.start = 10
    // before: g.start = 13
    // after: g.start = 8

    const all = getAllItemsVaryingSizes();
    const inRange = getInRangeItemsVaryingSizes(all);
    const selected = all.filter((i) => ["e", "g"].includes(i.id));
    const delta = -2;

    const result = calculateDisplacements(inRange, selected, delta);
    expect(result.displacements).toEqual({ g: -5, c: 2, d: 3, e: -4, f: 1 });
  });
});

describe("calculateDisplacements with range = entire table [0..7]", () => {
  it("Should move multiple items up across entire table", () => {
    /**
     * Suppose the range is the entire set of rows, [0..7].
     * That means inRangeItems = all 8 items: a,b,c,d,e,f,g,h
     *
     * For example:
     *   - selected = [c, e, g]
     *   - delta = -2
     *
     * "Before Movement" (the entire 8 in the window):
     *   a, b, c, d, e, f, g, h
     *   a, b,  , d,  , f,  , h
     *   a, b, d, f, h,  ,  ,
     *   c, a, e, b, g, d, f, h
     *
     * "After Movement" example, if we shift c,e,g upward by 2 pixels or indexes:
     *   c, a, e, b, g, d, f, h
     *
     * Adjust as necessary for your real logic.
     */
    const all = getAllItemsSize();
    // The range is now [0..7], so inRangeItems = entire array.
    const inRange = all; // all 8

    // Let's pick c,e,g as selected
    const selected = all.filter((i) => ["c", "e", "g"].includes(i.id));
    const delta = -2;

    // Example placeholder outcome:
    const result = calculateDisplacements(inRange, selected, delta);

    // Possibly c,e,g get -2, everything else is +1 or 0 depending on logic
    expect(result.displacements).toEqual({
      a: 1,
      b: 2,
      c: -2,
      d: 2,
      e: -2,
      f: 1,
      g: -2,
      h: 0,
    });
  });
});

describe("deltaScanRange", () => {
  it("a should not return deltas that go below 0 with positive delta", () => {
    /**
     * a, b, |c, d, e, f|, g, h
     *
     * selected = [a]
     * delta = 3
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    const selected = all.filter((i) => i.id === "a");
    const delta = 3;

    const result = deltaScanRange({
      selected,
      delta,
      numToScan: 10,
      lastIndex: all.length - 1,
    });
    expect(result.min).toBe(-3); // 0 // a cant be moved left
    expect(result.max).toBe(4); // 6 (g) -> one pos after range
  });
  it("a should not return deltas that go below 0 with negative delta", () => {
    /**
     * a, b, |c, d, e, f|, g, h
     *
     * selected = [a]
     * delta = -3
     */
    const all = getAllItemsSize();
    const inRange = getInRangeItemsSize1(all);
    const selected = all.filter((i) => i.id === "a");
    const delta = -3;

    const result = deltaScanRange({
      selected,
      delta,
      numToScan: 10,
      lastIndex: all.length - 1,
    });
    expect(result.min).toBe(3);
    expect(result.max).toBe(10);
  });
  it("b should not return deltas that go below 0 with positive delta", () => {
    /**
     * a, b, |c, d, e, f|, g, h
     *
     * selected = [b]
     * delta = 3
     */
    const all = getAllItemsSize();
    const selected = all.filter((i) => i.id === "b");
    const delta = 3;

    const result = deltaScanRange({
      selected,
      delta,
      numToScan: 10,
      lastIndex: all.length - 1,
    });
    expect(result.min).toBe(-4);
    expect(result.max).toBe(3);
  });
  it("a and b should not go below 0", () => {
    /**
     * | a, b, c, d, e, f|, g, h
     *
     * selected = [a, b]
     * delta = 0
     */
    const all = getAllItemsSize();
    const selected = all.filter((i) => ["a", "b"].includes(i.id));
    const delta = -1;

    const result = deltaScanRange({
      selected,
      delta,
      numToScan: 10,
      lastIndex: all.length - 1,
    });
    expect(result.min).toBe(1);
    expect(result.max).toBe(7);
  });
  it("a and b should not go below 0", () => {
    /**
     * | a, b, c, d, e, f|, g, h
     *
     * selected = [a, b]
     * delta = -1
     */
    const all = getAllItemsSize();
    const selected = all.filter((i) => ["a", "b"].includes(i.id));
    const delta = -1;

    const result = deltaScanRange({
      selected,
      delta,
      numToScan: 10,
      lastIndex: all.length - 1,
    });
    expect(result.min).toBe(1);
    expect(result.max).toBe(7);
  });
  it("a and b should not go below 0", () => {
    /**
     * | a, b, c, d, e, f|, g, h
     *
     * selected = [a, b]
     * delta = -2
     */
    const all = getAllItemsSize();
    const selected = all.filter((i) => ["a", "b"].includes(i.id));
    const delta = -2;

    const result = deltaScanRange({
      selected,
      delta,
      numToScan: 10,
      lastIndex: all.length - 1,
    });
    expect(result.min).toBe(2);
    expect(result.max).toBe(8);
  });
  it("c and e should not return deltas that go below 0 with positive delta", () => {
    /**
     * a, b, |c, d, e, f|, g, h
     *
     * selected = [c, e]
     * delta = 1
     */
    const all = getAllItemsSize();
    const selected = all.filter((i) => ["c", "e"].includes(i.id));
    const delta = 1;

    const result = deltaScanRange({
      selected,
      delta,
      numToScan: 10,
      lastIndex: all.length - 1,
    });
    expect(result.min).toBe(-3);
    expect(result.max).toBe(2);
  });
  it("moving 2 should not go below 0", () => {
    /**
     * a, b, |c, d, e, f|, g, h
     *
     * selected = [c, e]
     * delta = -4
     */
    const all = getAllItemsSize();
    const selected = all.filter((i) => ["c", "e"].includes(i.id));
    const delta = -4;

    const result = deltaScanRange({
      selected,
      delta,
      numToScan: 10,
      lastIndex: all.length - 1,
    });
    expect(result.min).toBe(2);
    expect(result.max).toBe(7);
  });
  it("should move from right to left", () => {
    /**
     * a, b, |c, d, e, f|, g, h
     *
     * selected = [h]
     * delta = -3
     */
    const all = getAllItemsSize();
    const selected = all.filter((i) => i.id === "h");
    const delta = -3;

    const result = deltaScanRange({
      selected,
      delta,
      numToScan: 10,
      lastIndex: all.length - 1,
    });
    expect(result.min + delta).toBe(-7);
    expect(result.max).toBe(3); // move -3 and then move +3 and we can't go more to the right
  });
});
