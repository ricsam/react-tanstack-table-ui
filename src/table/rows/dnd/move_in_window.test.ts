import { expect, describe, it } from "vitest";
import { Item, moveInWindow, PinPos } from "../move_in_window";

// 1. should move one non-pinned to non-pinned
// 2. should move one pinned to pinned
// 3. should move one pinned to non-pinned
// 4. should move one non-pinned to pinned

// 1. should move multiple pinned to non-pinned
// 2. should move multiple non-pinned to pinned
// 3. should move multiple pinned to pinned
// 4. should move multiple non-pinned to non-pinned

// should move left-pinned to right-pinned
// should unpin by moving to empty space
// should move multiple non-pinned to pinned-right
// should move multiple pinned to pinned-right

// should move a mix of pinned and non-pinned to pinned-left
// should move a mix of pinned and non-pinned to pinned-right
// should move a mix of pinned and non-pinned to non-pinned

// should be able to scroll the window and move

// when moving a mix of pinned and non-pinned to non-pinned then we should consider
// the pinned-left items as being moved from e.g. pos 0 to where-ever
// the scroll is at the moment. That delta should be applied to all selected items.
// If some items move out of bound then they should be moved to the end of the list.

// test classes:
// - move one
// - move multiple
// - move mix
// - out of bounds
// - scroll pinned overlay non-pinned
// - virtualized re-ararngements items
// - move pinned-left to pinned-right
// - only allow drag to items with the same groupId
// - move group of columns (not to be confused with the groupId which is handing drag boundries for subItems)

// if pinned items are dragged into empty table space, then unpin them (to be calculated using the window prop)

// if we are dragging some item with groupId "bla" then we can drop it onto items with groupId "bla".

// If you drag an item with groupId bla and places it below an expandable row that is expanded:
// -> then add the dragged row a child.
// An item could have an expander prop to be like: `expander: { state: 'expanded' | 'collapsed', groupId: "bla" }`

describe("scroll at initial position", () => {
  describe("move one", () => {
    it("1. should move one non-pinned to non-pinned", () => {
      const result = moveInWindow({
        window: {
          scroll: 0,
          size: 10,
          totalSize: 2,
          numItems: 2,
        },
        drag: {
          id: "1",
          deltaInnerScroll: 0,
          deltaOuterScroll: 0,
          deltaMouse: 3,
        },
        items: [
          {
            id: "1",
            start: 0,
            index: 0,
            size: 1,
            pinned: false,
          },
          {
            id: "2",
            index: 1,
            size: 1,
            start: 1,
            pinned: false,
          },
        ],
        selected: ["1"],
      });
      expect(result).toEqual({
        ancestors: {
          1: [],
          2: [],
        },
        displacements: {
          // 2 get moved to the index: 1 and 1 get moved to index
          1: 1,
          2: -1,
        },
        dragged: {
          targetIndex: 1,
          indexDelta: 1,
          pinned: false,
        },
        itemIndices: {
          "1": 1,
          "2": 0,
        },
        pinned: {
          1: false,
          2: false,
        },
      });
    });
    it("2. should move one pinned to pinned", () => {
      const result = moveInWindow({
        window: {
          scroll: 0,
          size: 10,
          totalSize: 2,
          numItems: 3,
        },
        drag: {
          id: "3",
          deltaInnerScroll: 0,
          deltaOuterScroll: 0,
          deltaMouse: -2,
        },
        items: [
          {
            start: 0,
            id: "1",
            size: 1,
            pinned: "start",
            index: 0,
          },
          {
            start: 1,
            id: "3",
            size: 1,
            pinned: "start",
            index: 1,
          },
          {
            id: "2",
            index: 2,
            size: 1,
            start: 2,
            pinned: false,
          },
        ],
        selected: ["3"],
      });
      expect(result).toEqual({
        // 1,3,2
        // p,p,n
        //
        // 1, ,2
        // p, ,n
        //
        // 1,2
        // p,n
        //
        // ,1,2
        // ,p,n
        displacements: {
          1: 1,
          2: 0,
          3: -1,
        },
        itemIndices: {
          "1": 1,
          "2": 2,
          "3": 0,
        },
        dragged: {
          targetIndex: 0,
          pinned: "start",
          indexDelta: -1,
        },
        pinned: {
          1: "start",
          2: false,
          3: "start",
        },
        ancestors: {
          1: [],
          2: [],
          3: [],
        },
      });
    });
    it("3. should move one pinned to non-pinned", () => {
      const result = moveInWindow({
        window: {
          scroll: 0,
          size: 10,
          totalSize: 2,
          numItems: 2,
        },
        drag: {
          id: "1",
          deltaInnerScroll: 0,
          deltaOuterScroll: 0,
          deltaMouse: 3,
        },
        items: [
          {
            id: "1",
            start: 0,
            index: 0,
            size: 1,
            pinned: "start",
          },
          {
            id: "2",
            index: 1,
            start: 1,
            size: 1,
            pinned: false,
          },
        ],
        selected: ["1"],
      });
      expect(result).toEqual({
        displacements: {
          // 2 get moved to the index: 1 and 1 get moved to index
          1: 1,
          2: -1,
        },
        itemIndices: {
          "1": 1,
          "2": 0,
        },
        dragged: {
          targetIndex: 1,
          pinned: false,
          indexDelta: 1,
        },
        pinned: {
          1: false,
          2: false,
        },
        ancestors: {
          1: [],
          2: [],
        },
      });
    });
    it("4. should move one non-pinned to pinned", () => {
      const result = moveInWindow({
        window: {
          scroll: 0,
          size: 10,
          totalSize: 2,
          numItems: 2,
        },
        drag: {
          id: "2",
          deltaInnerScroll: 0,
          deltaOuterScroll: 0,
          deltaMouse: -3,
        },
        items: [
          {
            start: 0,
            id: "1",
            size: 1,
            pinned: "start",
            index: 0,
          },
          {
            id: "2",
            index: 1,
            size: 1,
            start: 1,
            pinned: false,
          },
        ],
        selected: ["2"],
      });
      expect(result).toEqual({
        displacements: {
          // 2 get moved to the index: 1 and 1 get moved to index
          1: 1,
          2: -1,
        },
        itemIndices: {
          "1": 1,
          "2": 0,
        },
        dragged: {
          targetIndex: 0,
          pinned: "start",
          indexDelta: -1,
        },
        pinned: {
          1: "start",
          2: "start",
        },
        ancestors: {
          1: [],
          2: [],
        },
      });
    });
  });
  describe("move multiple", () => {
    it("1. should move multiple non-pinned to non-pinned", () => {
      const result = moveInWindow({
        window: {
          scroll: 0,
          size: 10,
          totalSize: 4,
          numItems: 4,
        },
        drag: {
          id: "1",
          deltaInnerScroll: 0,
          deltaOuterScroll: 0,
          deltaMouse: 1,
        },
        items: [
          {
            id: "1",
            start: 0,
            index: 0,
            size: 1,
            pinned: false,
          },
          {
            id: "2",
            index: 1,
            size: 1,
            start: 1,
            pinned: false,
          },
          {
            id: "3",
            index: 2,
            size: 1,
            start: 2,
            pinned: false,
          },
          {
            id: "4",
            index: 3,
            size: 1,
            start: 3,
            pinned: false,
          },
        ],
        selected: ["1", "3"],
      });
      expect(result).toEqual({
        displacements: {
          1: 1,
          3: 1,
          2: -1,
          4: -1,
        },
        itemIndices: {
          1: 1,
          3: 3,
          2: 0,
          4: 2,
        },
        // 1,2,3,4
        // 1,2,3,4
        // 1,2, ,4
        // 1,2,4,3
        //  ,2,4,3
        // 2, ,4,3
        // 1,2,4,3
        dragged: {
          targetIndex: 1,
          pinned: false,
          indexDelta: 1,
        },
        pinned: {
          1: false,
          2: false,
          3: false,
          4: false,
        },
        ancestors: {
          1: [],
          2: [],
          3: [],
          4: [],
        },
      });
    });
    it("2. should move multiple pinned to pinned", () => {
      const result = moveInWindow({
        items: [
          {
            start: 0,
            id: "1",
            size: 1,
            pinned: "start",
            index: 0,
          },
          {
            start: 1,
            id: "2",
            size: 1,
            pinned: "start",
            index: 1,
          },
          {
            start: 2,
            id: "3",
            size: 1,
            pinned: "start",
            index: 2,
          },
          {
            start: 3,
            id: "4",
            size: 1,
            pinned: "start",
            index: 3,
          },
        ],
        window: {
          scroll: 0,
          size: 10,
          totalSize: 2,
          numItems: 4,
        },
        drag: {
          id: "1",
          deltaInnerScroll: 0,
          deltaOuterScroll: 0,
          deltaMouse: 1,
        },
        selected: ["1", "3"],
      });
      expect(result).toEqual({
        itemIndices: {
          // 1,2,3,4
          // 1,2, ,4
          // 1,2,4,
          // 1,2,4,3
          //  ,2,4,3
          // 2,4,3,
          // 2, ,4,3,
          // 2,1,4,3,
          // 2,1,4,3, // final
          // 0,1,2,3 // indices
          1: 1,
          2: 0,
          3: 3,
          4: 2,
        },
        displacements: {
          1: 1,
          2: -1,
          3: 1,
          4: -1,
        },
        dragged: {
          targetIndex: 1,
          pinned: "start",
          indexDelta: 1,
        },
        pinned: {
          1: "start",
          2: "start",
          3: "start",
          4: "start",
        },
        ancestors: {
          1: [],
          2: [],
          3: [],
          4: [],
        },
      });
    });
    it("3. should move multiple pinned to non-pinned", () => {
      const result = moveInWindow({
        items: [
          {
            start: 0,
            index: 0,
            id: "1",
            size: 1,
            pinned: "start",
          },
          {
            start: 1,
            index: 1,
            id: "2",
            size: 1,
            pinned: "start",
          },
          {
            start: 2,
            index: 2,
            id: "3",
            size: 1,
            pinned: "start",
          },
          {
            start: 3,
            index: 3,
            id: "4",
            size: 1,
            pinned: "start",
          },
          {
            start: 4,
            index: 4,
            id: "5",
            size: 1,
            pinned: false,
          },
        ],
        window: {
          scroll: 0,
          size: 10,
          totalSize: 5,
          numItems: 5,
        },
        drag: {
          id: "4",
          deltaInnerScroll: 0,
          deltaOuterScroll: 0,
          deltaMouse: 1,
        },
        selected: ["1", "4"],
      });
      expect(result).toEqual({
        displacements: {
          1: 2,
          2: -1,
          3: -1,
          4: 1,
          5: -1,
        },
        itemIndices: {
          // 1,2,3,4,5 // move 1 and 4 with delta +1
          // p,p,p,p,n
          // 2,1,3,5,4 // moved with delta +1
          // p,p,p,n,p // this is incorrect, 4 is non-pinned now and 1 is non-pinned
          // 2,1,3,5,4 // final position
          // p,n,p,n,n // lets fix the pinned, by pushing the pinned items to the left

          // 2,1, ,5,4
          //   3       // move 3 by -gap size the the left, to close the gap. This is the "final step"
          // p,n, ,n,n
          //  ,p, , ,

          // 2,1,5,4, // move the items right of 3 to the left
          //   3
          // p,n,n,n,
          //  ,p, , ,

          // 2,3,1,5,4 // final position // move positions right of 2 to the right (except the pinned ones)
          // p,p,n,n,n // final pinned

          // 1,2,3,4,5 // start
          // 2,3,1,5,4 // final position
          // 0,1,2,3,4 // indices

          "1": 2,
          "2": 0,
          "3": 1,
          "4": 4,
          "5": 3,
        },
        dragged: {
          targetIndex: 4,
          pinned: false,
          indexDelta: 1,
        },
        pinned: {
          1: false,
          2: "start",
          3: "start",
          4: false,
          5: false,
        },
        ancestors: {
          1: [],
          2: [],
          3: [],
          4: [],
          5: [],
        },
      });
    });
    it("4. should move multiple non-pinned to pinned", () => {
      const result = moveInWindow({
        items: [
          {
            start: 0,
            index: 0,
            id: "1",
            size: 1,
            pinned: "start",
          },
          {
            start: 1,
            index: 1,
            id: "2",
            size: 1,
            pinned: false,
          },
          {
            start: 2,
            index: 2,
            id: "3",
            size: 1,
            pinned: false,
          },
          {
            start: 3,
            index: 3,
            id: "4",
            size: 1,
            pinned: false,
          },
          {
            start: 4,
            index: 4,
            id: "5",
            size: 1,
            pinned: false,
          },
        ],
        window: {
          scroll: 0,
          size: 10,
          totalSize: 5,
          numItems: 5,
        },
        drag: {
          id: "2",
          deltaInnerScroll: 0,
          deltaOuterScroll: 0,
          deltaMouse: -1,
        },
        selected: ["2", "5"],
      });
      expect(result).toEqual({
        displacements: {
          // 1,2,3,4,5 // start
          // 2,1,5,3,4 // final position
          // 0,1,2,3,4 // indices
          1: 1,
          2: -1,
          3: 1,
          4: 1,
          5: -2,
        },
        itemIndices: {
          // 1,2,3,4,5 // move 2 and 5 with delta -1
          // p,n,n,n,n
          // 2,1,3,5,4 // moved with delta -1
          // n,p,n,n,n // this is incorrect, 2 is non-pinned now and 5 is non-pinned
          // 2,1,3,5,4 // final position
          // p,p,n,p,n // lets fix the pinned, by pushing the pinned items to the left

          // first gap that will be found is between 5 and 1

          // 2,1,3,5,4
          // 1         // move 1 by -gap size the the left, to close the gap. This is the "final step"
          // n, ,n,n,n
          // p, , , ,

          // 2,3,5,4, // move the items right of 1 to the left
          // 1
          // n,n,n,n
          // p, , , ,

          // 2,3,1,5,4 // final position // move positions right of 0 to the right (except the pinned ones)
          // p,p,n,n,n // final pinned

          // 1,2,3,4,5 // start
          // 2,1,5,3,4 // final position
          // 0,1,2,3,4 // indices

          "1": 1,
          "2": 0,
          "3": 3,
          "4": 4,
          "5": 2,
        },
        dragged: {
          targetIndex: 0,
          pinned: "start",
          indexDelta: -1,
        },
        pinned: {
          1: "start",
          2: "start",
          3: false,
          4: false,
          5: "start",
        },
        ancestors: {
          1: [],
          2: [],
          3: [],
          4: [],
          5: [],
        },
      });
    });
    it("5. should move group with negative delta", () => {
      // 1,2,3,4,5,6,7,8,9,10 // start
      // 1,2,3,4,5,*,*,*,*,10 // remove
      // 1,6,7,8,9,2,3,4,5,*,*,*,*,10 // inject
      // 1,6,7,8,9,2,3,4,5,10 // result

      // in more detail:
      // 1,2,3,4,5,6,7,8,9,10 // start
      // 1,2,3,4,5,6,7,8,*,10 // remove
      // 1,2,3,4,5,6,7,8,10   // adjust indices (10: -1)
      //         9            // inject
      // 1,2,3,4,9,5,6,7,8,10 // adjust indices (5,6,7,8,9,10: +1)
      // 1,2,3,4,9,5,6,7,*,10 // remove
      // 1,2,3,4,9,5,6,7,10   // adjust indices (10: -1)
      //         8            // inject
      // 1,2,3,4,8,9,5,6,7,10 // adjust indices (9,5,6,7,10: +1)

      // 1,6,7,8,9,2,3,4,5,*,*,*,*,10 // inject
      // 1,6,7,8,9,2,3,4,5,10 // result
      const createItem = (index: number): Item => ({
        id: String(index + 1),
        start: index,
        index,
        size: 1,
        pinned: false,
      });
      const items: Item[] = [];
      for (let i = 0; i <= 10; i += 1) {
        items.push(createItem(i));
      }
      const selected: string[] = [];
      for (let i = 6; i <= 9; i += 1) {
        selected.push(String(i));
      }
      const result = moveInWindow({
        window: {
          scroll: 0,
          size: 10,
          totalSize: 4,
          numItems: 4,
        },
        drag: {
          id: "6",
          deltaInnerScroll: 0,
          deltaOuterScroll: 0,
          deltaMouse: -4,
        },
        items,
        selected,
      });
      const displacements: Record<string, number> = {};
      const itemIndices: Record<string, number> = {};
      const pinned: Record<string, PinPos> = {};
      const ancestors: Record<string, string[]> = {};
      items.forEach((item, index) => {
        const id = item.id;
        displacements[id] = 0;
        itemIndices[id] = index;
        pinned[id] = false;
        ancestors[id] = [];
      });
      selected.forEach((itemId) => {
        displacements[itemId] = -4;
        itemIndices[itemId] -= 4;
      });
      for (let i = 2; i <= 5; i += 1) {
        const itemId = String(i);
        displacements[itemId] = 4;
        itemIndices[itemId] += 4;
      }
      // 1,6,7,8,9,2,3,4,5,10 // result
      expect(result).toEqual({
        displacements,
        itemIndices,
        dragged: {
          targetIndex: 1,
          pinned: false,
          indexDelta: -4,
        },
        pinned,
        ancestors,
      });
    });
  });

  describe("should work with pinned right", () => {
    it("should move left-pinned to right-pinned", () => {
      const result = moveInWindow({
        items: [
          {
            start: 0,
            index: 0,
            id: "1",
            size: 1,
            pinned: "start",
          },
          {
            start: 1,
            index: 1,
            id: "2",
            size: 1,
            pinned: false,
          },
          {
            start: 2,
            index: 2,
            id: "3",
            size: 1,
            pinned: "end",
          },
          {
            start: 3,
            index: 3,
            id: "4",
            size: 1,
            pinned: "end",
          },
        ],
        // 0,1,2,3,4,5,6,7,8,9
        // 0               |
        // ---------------->
        window: {
          scroll: 0,
          size: 10,
          totalSize: 4,
          numItems: 4,
        },
        drag: {
          id: "1",
          deltaInnerScroll: 0,
          deltaOuterScroll: 0,
          deltaMouse: 8, // closest center is 8
        },
        selected: ["1"],
      });
      expect(result).toEqual({
        displacements: {
          1: 2,
          2: -1,
          3: -1,
          4: 0,
        },
        itemIndices: {
          1: 2,
          2: 0,
          3: 1,
          4: 3,
        },
        dragged: {
          targetIndex: 2,
          pinned: "end",
          indexDelta: 2,
        },
        pinned: {
          1: "end",
          2: false,
          3: "end",
          4: "end",
        },
        ancestors: {
          1: [],
          2: [],
          3: [],
          4: [],
        },
      });
    });
    it("should unpin by moving to empty space", { todo: true }, () => {
      const result = moveInWindow({
        items: [
          {
            start: 0,
            index: 0,
            id: "1",
            size: 1,
            pinned: "start",
          },
          {
            start: 1,
            index: 1,
            id: "2",
            size: 1,
            pinned: false,
          },
          {
            start: 2,
            index: 2,
            id: "3",
            size: 1,
            pinned: "end",
          },
          {
            start: 3,
            index: 3,
            id: "4",
            size: 1,
            pinned: "end",
          },
        ],
        // 0,1,2,3,4,5,6,7,8,9
        // 0               |
        // ---------------->
        window: {
          scroll: 0,
          size: 10,
          totalSize: 4,
          numItems: 4,
        },
        drag: {
          id: "1",
          deltaInnerScroll: 0,
          deltaOuterScroll: 0,
          deltaMouse: 4, // closest center is middle
        },
        selected: ["1"],
      });
      expect(result).toEqual({
        displacements: {
          1: 8,
          2: -1,
          3: -1,
          4: 0,
        },
        itemIndices: {
          1: 2,
          2: 0,
          3: 1,
          4: 3,
        },
        dragged: {
          targetIndex: 2,
          pinned: "end",
        },
        pinned: {
          1: "end",
          2: false,
          3: "end",
          4: "end",
        },
      });
    });
    it("should pin to the left of the pinned item when left is closer", () => {
      const result = moveInWindow({
        items: [
          {
            start: 0,
            index: 0,
            id: "1",
            size: 1,
            pinned: false,
          },
          {
            start: 1,
            index: 1,
            id: "2",
            size: 1,
            pinned: false,
          },
          {
            start: 2,
            index: 2,
            id: "3",
            size: 1,
            pinned: "end",
          },
          {
            start: 3,
            index: 3,
            id: "4",
            size: 1,
            pinned: "end",
          },
        ],
        // 0,1,2,3,4,5,6,7,8,9
        // 0               |
        // ---------------->
        window: {
          scroll: 0,
          size: 10,
          totalSize: 4,
          numItems: 4,
        },
        drag: {
          id: "1",
          deltaInnerScroll: 0,
          deltaOuterScroll: 0,
          deltaMouse: 6, // closest center is 8
        },
        selected: ["1"],
      });
      expect(result).toEqual({
        displacements: {
          1: 1,
          2: -1,
          3: 0,
          4: 0,
        },
        itemIndices: {
          1: 1,
          2: 0,
          3: 2,
          4: 3,
        },
        dragged: {
          targetIndex: 1,
          pinned: "end",
          indexDelta: 1,
        },
        pinned: {
          1: "end",
          2: false,
          3: "end",
          4: "end",
        },
        ancestors: {
          1: [],
          2: [],
          3: [],
          4: [],
        },
      });
    });
    it(
      "should pin to the right of the pinned item when right is closer",
      { todo: true },
      () => {},
    );
    it(
      "should move multiple non-pinned to pinned-right",
      { todo: true },
      () => {},
    );
    it("should move multiple pinned to pinned-right", { todo: true }, () => {});
  });

  describe("should work when the items have actual sizes", () => {
    it("should move one", () => {
      const result = moveInWindow({
        items: [
          {
            id: "id",
            index: 0,
            pinned: "start",
            start: 0,
            size: 150,
          },
          {
            id: "location",
            index: 1,
            pinned: "start",
            start: 150,
            size: 200,
          },
          {
            id: "expander",
            index: 2,
            pinned: false,
            start: 350,
            size: 150,
          },
          {
            id: "select",
            index: 3,
            pinned: false,
            start: 500,
            size: 150,
          },
          {
            id: "drag-handle",
            index: 4,
            pinned: false,
            start: 650,
            size: 60,
          },
          {
            id: "country-code",
            index: 5,
            pinned: false,
            start: 710,
            size: 200,
          },
          {
            id: "country",
            index: 6,
            pinned: false,
            start: 910,
            size: 150,
          },
          {
            id: "continent",
            index: 7,
            pinned: false,
            start: 1060,
            size: 200,
          },
          {
            id: "language",
            index: 8,
            pinned: false,
            start: 1260,
            size: 200,
          },
          {
            id: "favorite-game",
            index: 9,
            pinned: false,
            start: 1460,
            size: 200,
          },
          {
            id: "birth-month",
            index: 10,
            pinned: false,
            start: 1660,
            size: 200,
          },
          {
            id: "is-active",
            index: 11,
            pinned: false,
            start: 1860,
            size: 200,
          },
          {
            id: "winnings-2021",
            index: 12,
            pinned: false,
            start: 2060,
            size: 150,
          },
          {
            id: "full-name",
            index: 99,
            pinned: "end",
            start: 19310,
            size: 200,
          },
        ],
        selected: ["continent"],
        drag: {
          deltaInnerScroll: 0,
          deltaMouse: -144,
          deltaOuterScroll: 0,
          id: "continent",
        },
        window: {
          numItems: 100,
          scroll: 0,
          size: 1920,
          totalSize: 19510,
        },
      });
      expect(result).toEqual({
        displacements: {
          id: 0,
          location: 0,
          expander: 0,
          select: 0,
          "drag-handle": 0,
          "country-code": 0,
          country: 200,
          continent: -150,
          language: 0,
          "favorite-game": 0,
          "birth-month": 0,
          "is-active": 0,
          "winnings-2021": 0,
          "full-name": 0,
        },
        dragged: {
          targetIndex: 6,
          pinned: false,
          indexDelta: -1,
        },
        itemIndices: {
          id: 0,
          location: 1,
          expander: 2,
          select: 3,
          "drag-handle": 4,
          "country-code": 5,
          country: 7, // moved
          continent: 6, // moved
          language: 8,
          "favorite-game": 9,
          "birth-month": 10,
          "is-active": 11,
          "winnings-2021": 12,
          "full-name": 99,
        },
        pinned: {
          id: "start",
          location: "start",
          expander: false,
          select: false,
          "drag-handle": false,
          "country-code": false,
          country: false,
          continent: false,
          language: false,
          "favorite-game": false,
          "birth-month": false,
          "is-active": false,
          "winnings-2021": false,
          "full-name": "end",
        },
        ancestors: {
          id: [],
          location: [],
          expander: [],
          select: [],
          "drag-handle": [],
          "country-code": [],
          country: [],
          continent: [],
          language: [],
          "favorite-game": [],
          "birth-month": [],
          "is-active": [],
          "winnings-2021": [],
          "full-name": [],
        },
      });
    });
  });

  describe("Can move group", () => {
    it("should be able to do a basic move", () => {
      const result = moveInWindow({
        window: {
          scroll: 0,
          size: 10,
          totalSize: 2,
          numItems: 2,
        },
        drag: {
          deltaInnerScroll: 0,
          deltaOuterScroll: 0,
          deltaMouse: 1,
        },
        items: [
          {
            id: "1",
            start: 0,
            index: 0,
            size: 1,
            pinned: false,
          },
          {
            id: "2",
            index: 1,
            size: 1,
            start: 1,
            pinned: false,
          },
          {
            id: "3",
            index: 2,
            size: 1,
            start: 2,
            pinned: false,
          },
          {
            id: "4",
            index: 3,
            size: 1,
            start: 3,
            pinned: false,
          },
        ],
        selected: ["1", "2"],
      });
      expect(result).toEqual({
        // 1,2,3,4
        // 3,1,2,4
        displacements: {
          1: 1,
          2: 1,
          3: -2,
          4: 0,
        },
        dragged: {
          targetIndex: 1,
          indexDelta: 1,
          pinned: false,
        },
        itemIndices: {
          "1": 1,
          "2": 2,
          "3": 0,
          "4": 3,
        },
        pinned: {
          1: false,
          2: false,
          3: false,
          4: false,
        },
        ancestors: {
          1: [],
          2: [],
          3: [],
          4: [],
        },
      });
    });
    it("should not move if delta is 0", () => {
      const result = moveInWindow({
        window: {
          scroll: 0,
          size: 10,
          totalSize: 2,
          numItems: 2,
        },
        drag: {
          deltaInnerScroll: 0,
          deltaOuterScroll: 0,
          deltaMouse: 0,
        },
        items: [
          {
            id: "1",
            start: 0,
            index: 0,
            size: 1,
            pinned: false,
          },
          {
            id: "2",
            index: 1,
            size: 1,
            start: 1,
            pinned: false,
          },
          {
            id: "3",
            index: 2,
            size: 1,
            start: 2,
            pinned: false,
          },
          {
            id: "4",
            index: 3,
            size: 1,
            start: 3,
            pinned: false,
          },
        ],
        selected: ["1", "2"],
      });
      expect(result).toEqual({
        // 1,2,3,4
        displacements: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
        },
        dragged: {
          targetIndex: 0,
          indexDelta: 0,
          pinned: false,
        },
        itemIndices: {
          "1": 0,
          "2": 1,
          "3": 2,
          "4": 3,
        },
        pinned: {
          1: false,
          2: false,
          3: false,
          4: false,
        },
        ancestors: {
          1: [],
          2: [],
          3: [],
          4: [],
        },
      });
    });
  });
});
