import { expect, describe, it } from "vitest";
import { move } from "./move";

// 1. should move one non-pinned to non-pinned
// 2. should move one pinned to pinned
// 3. should move one pinned to non-pinned
// 4. should move one non-pinned to pinned

// 1. should move multiple pinned to non-pinned
// 2. should move multiple non-pinned to pinned
// 3. should move multiple pinned to pinned
// 4. should move multiple non-pinned to non-pinned

// should move multiple non-pinned to pinned-right
// should move multiple pinned to pinned-right
// should move a mix of pinned and non-pinned to pinned-right

// should move a mix of pinned and non-pinned to pinned
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

// if pinned items are dragged into empty table space, then unpin them
// if we are dragging some item with groupId "bla" then we can drop it onto items with groupId "bla".
// if we are hoving over an item with childrenGroupId "bla"
// then the items will be added as children and not dispace the parent - if the dragged items has groupId "bla"

// If you drag on to the expand arrow, then add as a child, otherwise just displace the row.
// It must be indicated on the mouse prop if we are dragging to the expand arrow or just the row.
// An item could have an expander prop to be like: `expander: { enabled: true, groupId: "bla" }`
// Drag could have a prop that says says expander: true / false depending on if there is a keyboard key pressed or something.

describe("basic tests", () => {
  describe("move one", () => {
    it("1. should move one non-pinned to non-pinned", () => {
      const result = move({
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
        displacements: {
          // 2 get moved to the index: 1 and 1 get moved to index
          1: 1,
          2: -1,
        },
        dragged: {
          targetIndex: 1,
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
      const result = move({
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
        },
        pinned: {
          1: "start",
          2: false,
          3: "start",
        },
      });
    });
    it("3. should move one pinned to non-pinned", () => {
      const result = move({
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
        },
        pinned: {
          1: false,
          2: false,
        },
      });
    });
    it("4. should move one non-pinned to pinned", () => {
      const result = move({
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
        },
        pinned: {
          1: "start",
          2: "start",
        },
      });
    });
  });
  describe("move multiple", () => {
    it("1. should move multiple non-pinned to non-pinned", () => {
      const result = move({
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
        },
        pinned: {
          1: false,
          2: false,
          3: false,
          4: false,
        },
      });
    });
    it("2. should move multiple pinned to pinned", () => {
      const result = move({
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
        },
        pinned: {
          1: "start",
          2: "start",
          3: "start",
          4: "start",
        },
      });
    });
    it("3. should move multiple pinned to non-pinned", () => {
      const result = move({
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
        },
        pinned: {
          1: false,
          2: "start",
          3: "start",
          4: false,
          5: false,
        },
      });
    });
    it("4. should move multiple non-pinned to pinned", () => {
      const result = move({
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
        },
        pinned: {
          1: "start",
          2: "start",
          3: false,
          4: false,
          5: "start"
        },
      });
    });
  });
});
