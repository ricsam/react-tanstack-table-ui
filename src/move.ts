export type PinPos = false | "start" | "end";

/**
 * Virtualized Item
 */
export interface Item {
  index: number;
  id: string;
  start: number; // pixel position
  size: number; // pixel size
  pinned: PinPos;
}

type MinDistance = {
  id: string;
  distance: number;
  pinned: PinPos;
};

function getMinDistance({
  displacements,
  items,
  draggedPos,
  positions,
  sizes,
  pinned,
  window,
}: {
  draggedPos: number;
  items: Item[];
  displacements: Record<string, number>;
  positions: Record<string, number>;
  sizes: Record<string, number>;
  pinned: Record<string, PinPos>;
  window: VirtualizedWindow;
}): MinDistance {
  let itemId: undefined | string;
  let distance = Infinity;
  const itemIndexMap: Record<string, number> = {};
  const indexItemMap: Record<string, string> = {};
  items.forEach((item, itemIndex) => {
    let pos = positions[item.id];

    if (item.pinned === "start") {
      pos = positions[item.id] + window.scroll;
    } else if (item.pinned === "end") {
      const itemLeftFromEnd = window.totalSize - positions[item.id];
      const windowRightPos = window.scroll + window.size;
      pos = windowRightPos - itemLeftFromEnd;
    }

    const d = draggedPos - (pos + sizes[item.id] / 2 + displacements[item.id]);

    const absD = Math.abs(d);
    if (absD < Math.abs(distance)) {
      distance = d;
      itemId = item.id;
    }
    itemIndexMap[item.id] = itemIndex;
    indexItemMap[itemIndex] = item.id;
  });

  if (!itemId) {
    console.log({ items, draggedPos, positions, sizes, displacements });
    throw new Error("No item found");
  }

  const toPin = pinned[itemId];

  return {
    id: itemId,
    distance,
    pinned: toPin,
  };
}

export type VirtualizedWindow = {
  /**
   * How far have we scrolled inside the table
   */
  scroll: number;
  /**
   * what is the width / height of the table
   */
  size: number;
  /**
   * content size what is the total size of the content inside the table. The accumulated size of all items.
   */
  totalSize: number;

  /**
   * total number of items
   */
  numItems: number;
};

export type DragInfo = {
  /**
   * TODO make optional.
   * Calculate closest distance based on the id or the mid point of the selected items
   */
  id?: string;
  /**
   * How far have we scrolled inside the table while dragging
   * This is not applied when moving pinned items
   */
  deltaInnerScroll: number;
  /**
   * How far has the ancestor elements scrolled while dragging (which will offset the table and thus move the items (pinned and non-pinned))
   */
  deltaOuterScroll: number;
  /**
   * How far has the mouse moved while dragging
   */
  deltaMouse: number;
};

type MoveInfo = {
  displacements: Record<string, number>;
  dragged: {
    /**
     * If DragInfo.id is provided then this will be defined
     */
    targetIndex?: number;
    pinned: PinPos;
    indexDelta: number;
  };
  itemIndices: Record<string, number>;
  pinned: Record<string, PinPos>;
  ancestors: Record<string, string[]>;
};

/**
 * move virtualized items
 */
export const move = (moveInput: {
  /**
   * The virtualized items that are displayed in the table.
   * The pinned items should come first and last.
   * The start of pinned items is as if they were not pinned.
   *
   * hierarichal items are flat
   */
  items: Item[];
  /**
   * The selected items
   */
  selected: string[];
  window: VirtualizedWindow;
  drag: DragInfo;
}): MoveInfo => {
  // console.log(structuredClone(moveInput));
  const { items, selected, window, drag } = moveInput;
  const displacements: Record<string, number> = {};
  const ancestors: Record<string, string[]> = {};
  const pinned: Record<string, PinPos | false> = {};
  const positions: Record<string, number> = {};
  const itemIndices: Record<string, number> = {};
  const sizes: Record<string, number> = {};
  const itemLookup: Record<string, Item> = {};

  let dragged: Item | undefined;

  const pinnedLeft: Item[] = [];
  const pinnedRight: Item[] = [];

  items.forEach((item) => {
    if (item.pinned === "start") {
      pinnedLeft.push(item);
    } else if (item.pinned === "end") {
      pinnedRight.push(item);
    }
  });

  items.forEach((item) => {
    if (displacements[item.id] !== undefined) {
      throw new Error(`Duplicate item (${item.id}) in items`);
    }

    positions[item.id] = item.start;

    displacements[item.id] = 0;
    sizes[item.id] = item.size;
    pinned[item.id] = item.pinned;
    itemIndices[item.id] = item.index;
    itemLookup[item.id] = item;

    if (item.id === drag.id) {
      dragged = item;
    }
  });

  let draggedIsPinned: PinPos = false;
  let defaultTargetIndex: number | undefined;

  if (dragged) {
    draggedIsPinned = pinned[dragged.id];
    defaultTargetIndex = dragged.index;
  } else {
    // when moving a column group the PinPos should be the same for all selected
    draggedIsPinned = pinned[selected[0]];
  }

  const defaultMove: MoveInfo = {
    displacements,
    itemIndices,
    dragged: {
      targetIndex: defaultTargetIndex,
      pinned: draggedIsPinned,
      indexDelta: 0,
    },
    pinned,
    ancestors,
  };

  const firstSelected = selected[0];
  const lastSelected = selected[selected.length - 1];

  const selectedRange: [number, number] = [
    positions[firstSelected],
    positions[lastSelected] + sizes[lastSelected],
  ];

  // This default pos is used when drag.id is undefined, that would be the case if e.g. moving a column group
  let midPositionOfDragged =
    selectedRange[0] + (selectedRange[1] - selectedRange[0]) / 2;

  if (typeof drag.id !== "undefined") {
    midPositionOfDragged = positions[drag.id] + sizes[drag.id] / 2;
  }

  let draggedPos =
    midPositionOfDragged + drag.deltaMouse + drag.deltaOuterScroll;

  if (!draggedIsPinned) {
    draggedPos += drag.deltaInnerScroll;
  }

  if (Number.isNaN(draggedPos)) {
    console.log({ midPositionOfDragged, drag, selectedRange, positions, selected });
    throw new Error("draggedPos is NaN");
  }

  const iterate = ({
    dragged,
    displacements,
    itemIndices,
    pinned,
    positions,
  }: {
    dragged?: Item;
    displacements: Record<string, number>;
    itemIndices: Record<string, number>;
    pinned: Record<string, PinPos | false>;
    positions: Record<string, number>;
  }) => {
    const minDistance = getMinDistance({
      draggedPos,
      items,
      positions,
      sizes,
      displacements,
      pinned,
      window,
    });

    if (minDistance.id === drag.id) {
      return { result: defaultMove, minDistance };
    }

    const result = getDisplacements({
      minDistance,
      pinned,
      displacements,
      itemIndices,
      dragged,
      itemLookup,
      selected,
      drag,
      items,
      positions,
      window,
      ancestors,
    });
    return { result, minDistance };
  };

  const iterateInput = {
    dragged,
    displacements: { ...displacements },
    pinned: { ...pinned },
    itemIndices: { ...itemIndices },
    positions: { ...positions },
  };

  // console.log(structuredClone(iterateInput), items);

  const iterateOutput = iterate(iterateInput);

  // console.log(structuredClone(iterateOutput.result));

  return iterateOutput.result;
};

function displace({
  itemLookup,
  dragged,
  selected,
  items,
  displacements,
  minDistance,
  pinned,
  itemIndices,
  positions,
  window,
}: {
  dragged?: Item;
  selected: string[];
  items: Item[];
  displacements: Record<string, number>;
  itemIndices: Record<string, number>;
  itemLookup: Record<string, Item>;
  minDistance: MinDistance;
  pinned: Record<string, PinPos>;
  positions: Record<string, number>;
  window: VirtualizedWindow;
}): MoveInfo["dragged"] {
  const getPosForIndex = (
    index: number,
    injectedSize: number,
    selectedId: string,
  ) => {
    const newIndexMap: Record<string, string> = Object.fromEntries(
      Object.entries(itemIndices)
        .filter(([id]) => id !== selectedId)
        .map(([id, index]) => [index, id]),
    );
    let id;

    id = newIndexMap[index];
    if (typeof id !== "undefined") {
      return positions[id] + displacements[id];
    }
    id = newIndexMap[index - 1];
    if (typeof id !== "undefined") {
      return positions[id] + itemLookup[id].size + displacements[id];
    }
    id = newIndexMap[index + 1];
    if (typeof id !== "undefined") {
      return positions[id] + displacements[id] - injectedSize;
    }

    return undefined;
  };
  const targetPinned = pinned[minDistance.id];
  let newIndex = itemLookup[minDistance.id].index;

  const draggedIsPinned = dragged ? dragged.pinned : pinned[selected[0]];

  // if we are moving a new item into the pinned space
  if (targetPinned !== false && draggedIsPinned !== targetPinned) {
    // when moving an item into a pinned space we are NOT doing the remove and inject algo, instead we are just injecting. Therefore we can inject before or after the minDistanceItem
    if (targetPinned === "start") {
      // we are pinning a col to the start
      // if minItemId is the 0 index, default it will inject before 0 index, but if the distance is positive we can inject after the 0 index
      if (minDistance.distance > 0) {
        newIndex += 1;
      }
    } else if (targetPinned === "end") {
      // we are pinning a col to the end
      // if minItemId is on right side, it will by default inject to the right of the minItem. But if the distance is negative we can inject to the left of the minItem
      if (minDistance.distance < 0) {
        newIndex -= 1;
      }
    }
  }

  // let's say that when we are moving a column group (i.e. dragged is undefined) then we are treating all selected
  // items as one item. Thus the dragged index will be the one of the first selected
  const prevIndex = dragged ? dragged.index : itemLookup[selected[0]].index;
  // todo, dragged.index may be undefined when moving a col group
  const delta = newIndex - prevIndex;

  const removeItem = (itemId: string) => {
    if (!itemLookup[itemId]) {
      console.log("@removeitem", { itemLookup, items, itemId });
    }
    const originalIndex = itemLookup[itemId].index;
    // we have to move delta steps but if we encounter any selected items them we skip them
    const newItemIndex = originalIndex + delta;

    // "remove" the item, and decrement the index of all items to the right
    items.forEach((item) => {
      if (itemIndices[item.id] >= originalIndex) {
        itemIndices[item.id] -= 1;
        displacements[item.id] -= itemLookup[itemId].size;
      }
    });
  };

  const injectItem = (itemId: string) => {
    const originalIndex = itemLookup[itemId].index;
    const newItemIndex = originalIndex + delta;

    // "inject" the item, and increment the index of all items to the right of the injected position
    items.forEach((item) => {
      if (itemIndices[item.id] >= newItemIndex) {
        itemIndices[item.id] += 1;
        displacements[item.id] += itemLookup[itemId].size;
      }
    });

    const newItemPos = getPosForIndex(
      newItemIndex,
      itemLookup[itemId].size,
      itemId,
    );

    // inject the selected item
    if (typeof newItemPos === "number") {
      // add the moved item to the newItemIndex object so adjacent moved items can reference it in getStartForIndex
      itemIndices[itemId] = newItemIndex;

      // the item should be displaced by the delta between the new pos and the original pos
      displacements[itemId] = newItemPos - positions[itemId];
    } else if (delta > 0) {
      // move item out from the range, exit bellow
      const endOfWindow =
        items[items.length - 1].start + items[items.length - 1].size;
      displacements[itemId] = endOfWindow - itemLookup[itemId].start;
    } else {
      // delta < 0
      // move item out from the range, exit above
      const startOfWindow = items[0].start;
      displacements[itemId] =
        startOfWindow - itemLookup[itemId].start - itemLookup[itemId].size;
    }
  };

  for (let i = selected.length - 1; i >= 0; i--) {
    const sel = selected[i];
    removeItem(sel);
  }
  for (const sel of selected) {
    injectItem(sel);
  }

  //#region fix pinned indices
  // when multimoving items to pinned all should become pinned.
  selected.forEach((id) => {
    pinned[id] = targetPinned;
  });

  const pinnedStart: Item[] = [];
  const pinnedEnd: Item[] = [];

  const sortedItems = [...items].sort(
    (a, b) => itemIndices[a.id] - itemIndices[b.id],
  );

  for (const item of sortedItems) {
    if (pinned[item.id] === "start") {
      pinnedStart.push(item);
    } else if (pinned[item.id] === "end") {
      pinnedEnd.push(item);
    }
  }

  /**
   * it is reversed, so the first item is the last pinned item
   */
  const reversePinnedLinkedList: Record<string, string | null> = {};
  const pinnedLinkedList: Record<string, string | null> = {};

  const addToLinkedList = (items: Item[]) => {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      reversePinnedLinkedList[item.id] = items[i - 1]?.id ?? null;
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      pinnedLinkedList[item.id] = items[i + 1]?.id ?? null;
    }
  };
  addToLinkedList(pinnedStart);
  addToLinkedList(pinnedEnd);

  const iterateOverLinkedList = (
    list: Record<string, string | null>,
    startId: string,
    cb: (item: Item) => void,
  ) => {
    let current: string | null = startId;
    while (current) {
      cb(itemLookup[current]);
      current = list[current];
    }
  };

  for (let i = sortedItems.length - 1; i >= 0; i--) {
    const item = sortedItems[i];
    if (pinned[item.id] !== false) {
      // from right to left it is technically the next item
      const nextItem = reversePinnedLinkedList[item.id];
      let gap = itemIndices[item.id];
      if (nextItem) {
        gap = itemIndices[item.id] - itemIndices[nextItem];
      } else if (pinnedLinkedList[item.id]) {
        // we are at the end of the chain
        continue;
      } else {
        // we are operating on a single pinned item, but with a gap to the left / right of the window
        // TODO test this
        if (pinned[item.id] === "end") {
          gap = window.numItems - 1 - gap;
        }
      }

      // gap to the next item is too big, let's move it
      if (gap > 1) {
        // remove item
        // a,x,x,b,c,d,x,x / gap between b and a is 3
        // a,x,x,b,c,d,x,x / remove b and move c,d, one step to the left
        // a,x,x,x,x

        // size of b,c,d
        let size = 0;
        let numItems = 0;
        let lastIndex = 0;

        const posLeftOfGap = !nextItem
          ? 0
          : positions[nextItem] +
            itemLookup[nextItem].size +
            displacements[nextItem];

        iterateOverLinkedList(pinnedLinkedList, item.id, (item) => {
          size += item.size;
          numItems += 1;
          lastIndex = itemIndices[item.id];
          // FINAL STEP
          displacements[item.id] -=
            positions[item.id] + displacements[item.id] - posLeftOfGap;
          itemIndices[item.id] -= gap - 1;
        });
        // move x,x after the d
        sortedItems.forEach((item) => {
          if (itemIndices[item.id] > lastIndex) {
            displacements[item.id] -= size;
            itemIndices[item.id] -= numItems;
          }
        });
        // now we have the following:
        // a,x,x,x,x
        //  ,b,c,d // with final step
        //      ,b,c,d
        // lets move everything after a to the right
        sortedItems.forEach((item) => {
          if (pinnedLinkedList[item.id] !== undefined) {
            return;
          }
          if (!nextItem || itemIndices[item.id] > itemIndices[nextItem]) {
            displacements[item.id] += size;
            itemIndices[item.id] += numItems;
          }
        });
        // now we have the following:
        // a, , , ,x,x,x,x
        //  ,b,c,d // with final step
        //      ,b,c,d
        // lets move b,c,d down
        // a, , , ,x,x,x,x / we now have the following, with space for b,c,d
        // let's "inject" b,c,d after a
        // a,b,c,d,x,x,x,x
        // FINAL STEP
      }
    }
  }
  //#endregion

  //#region fix pinned positions
  // for (let i = 0; i < pinnedStart.length; i++) {
  //   const pinned = pinnedStart[i];

  //   const desiredPos =
  //     i === 0
  //       ? 0
  //       : positions[pinnedStart[i - 1].id] +
  //         displacements[pinnedStart[i - 1].id] +
  //         itemLookup[pinnedStart[i - 1].id].size;

  //   const delta =
  //     desiredPos - (positions[pinned.id] + displacements[pinned.id]);

  //   displacements[pinned.id] += delta;
  // }
  //#endregion

  return {
    targetIndex: newIndex,
    pinned: targetPinned,
    indexDelta: newIndex - prevIndex,
  };
}

function getDisplacements({
  minDistance,
  displacements,
  itemIndices,
  pinned,
  dragged,
  itemLookup,
  selected,
  items,
  drag,
  positions,
  window,
  ancestors,
}: {
  minDistance: MinDistance;
  displacements: Record<string, number>;
  itemIndices: Record<string, number>;
  pinned: Record<string, PinPos | false>;
  dragged?: Item;
  itemLookup: Record<string, Item>;
  selected: string[];
  items: Item[];
  drag: DragInfo;
  positions: Record<string, number>;
  ancestors: Record<string, string[]>;
  window: VirtualizedWindow;
}): MoveInfo {
  return {
    displacements,
    itemIndices,
    ancestors,
    dragged: displace({
      dragged,
      selected,
      items,
      displacements,
      itemIndices,
      itemLookup,
      minDistance,
      pinned,
      positions,
      window,
    }),
    pinned,
  };
}
