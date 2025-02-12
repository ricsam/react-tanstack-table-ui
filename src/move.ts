type PinPos = false | "start" | "end";

/**
 * Virtualized Item
 */
interface Item {
  index: number;
  id: string;
  start: number; // pixel position
  size: number; // pixel size
  pinned: PinPos;
}

type MinDistance = {
  id: string;
  distance: number;
};

function testDisplacements({
  displacements,
  items,
  draggedPos,
  positions,
  sizes,
}: {
  draggedPos: number;
  items: Item[];
  displacements: Record<string, number>;
  positions: Record<string, number>;
  sizes: Record<string, number>;
}): MinDistance {
  let itemId: undefined | string;
  let distance = Infinity;
  items.forEach((item) => {
    const d = Math.abs(
      draggedPos -
        (positions[item.id] + sizes[item.id] / 2 + displacements[item.id]),
    );
    if (d < distance) {
      distance = d;
      itemId = item.id;
    }
  });

  if (!itemId) {
    throw new Error("No item found");
  }

  return {
    id: itemId,
    distance,
  };
}

type DragInfo = {
  id: string;
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

export const move = ({
  items,
  selected,
  window,
  drag,
}: {
  /**
   * The virtualized items that are displayed in the table.
   * The pinned items should come first and last.
   * The start of pinned items is as if they were not pinned.
   */
  items: Item[];
  /**
   * The selected items
   */
  selected: string[];
  window: {
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
  drag: DragInfo;
}) => {
  const displacements: Record<string, number> = {};
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

    if (item.pinned === "start") {
      positions[item.id] = item.start + window.scroll;
    } else if (item.pinned === "end") {
      const itemRight = window.totalSize - (item.start + item.size);
      positions[item.id] = window.scroll + window.size - itemRight;
    } else {
      positions[item.id] = item.start;
    }

    displacements[item.id] = 0;
    sizes[item.id] = item.size;
    pinned[item.id] = item.pinned;
    itemIndices[item.id] = item.index;
    itemLookup[item.id] = item;

    if (item.id === drag.id) {
      dragged = item;
    }
  });

  if (!dragged) {
    throw new Error(
      `There must be a dragged item (${drag.id}), otherwise what are we moving?`,
    );
  }

  const defaultMove = {
    displacements,
    dragged: {
      targetIndex: dragged.index,
      pinned: pinned[dragged.id],
    },
    pinned,
  };

  let draggedPos =
    positions[drag.id] +
    sizes[drag.id] / 2 +
    drag.deltaMouse +
    drag.deltaOuterScroll;

  if (!dragged.pinned) {
    draggedPos += drag.deltaInnerScroll;
  }

  const iterate = ({
    dragged,
    displacements,
    itemIndices,
    pinned,
  }: {
    dragged: Item;
    displacements: Record<string, number>;
    itemIndices: Record<string, number>;
    pinned: Record<string, PinPos | false>;
  }) => {
    const minDistance = testDisplacements({
      draggedPos,
      items,
      positions,
      sizes,
      displacements,
    });

    if (minDistance.id === drag.id) {
      return defaultMove;
    }

    return getDisplacements({
      minDistance,
      pinned,
      displacements,
      itemIndices,
      dragged,
      itemLookup,
      selected,
      drag,
      items,
    });
  };

  const result = iterate({
    dragged,
    displacements: { ...displacements },
    pinned: { ...pinned },
    itemIndices: { ...itemIndices },
  });
  return result;
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
}: {
  dragged: Item;
  selected: string[];
  items: Item[];
  displacements: Record<string, number>;
  itemIndices: Record<string, number>;
  itemLookup: Record<string, Item>;
  minDistance: MinDistance;
  pinned: Record<string, PinPos>;
}) {
  const getStartForIndex = (
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
      return itemLookup[id].start + displacements[id];
    }
    id = newIndexMap[index - 1];
    if (typeof id !== "undefined") {
      return itemLookup[id].start + itemLookup[id].size + displacements[id];
    }
    id = newIndexMap[index + 1];
    if (typeof id !== "undefined") {
      return itemLookup[id].start + displacements[id] - injectedSize;
    }

    return undefined;
  };
  const targetPinned = pinned[minDistance.id];

  const newIndex = itemLookup[minDistance.id].index;
  selected.forEach((id) => {
    pinned[id] = targetPinned;
  });
  const prevIndex = dragged.index;

  const delta = newIndex - prevIndex;

  for (let i = selected.length - 1; i >= 0; i--) {
    const sel = selected[i];
    const originalIndex = itemLookup[sel].index;
    const newItemIndex = originalIndex + delta;
    // "remove" the item, and decrement the index of all items to the right
    items.forEach((item) => {
      if (itemIndices[item.id] >= originalIndex) {
        itemIndices[item.id] -= 1;
        displacements[item.id] -= itemLookup[sel].size;
      }
    });

    // "inject" the item, and increment the index of all items to the right of the injected position
    items.forEach((item) => {
      if (itemIndices[item.id] >= newItemIndex) {
        itemIndices[item.id] += 1;
        displacements[item.id] += itemLookup[sel].size;
      }
    });

    const newItemStart = getStartForIndex(
      newItemIndex,
      itemLookup[sel].size,
      sel,
    );

    // inject the selected item
    if (typeof newItemStart === "number") {
      // add the moved item to the newItemIndex object so adjacent moved items can reference it in getStartForIndex
      itemIndices[sel] = newItemIndex;

      // the item should be displaced by the delta between the new pos and the original pos
      displacements[sel] = newItemStart - itemLookup[sel].start;
    } else if (delta > 0) {
      // move item out from the range, exit bellow
      const endOfWindow =
        items[items.length - 1].start + items[items.length - 1].size;
      displacements[sel] = endOfWindow - itemLookup[sel].start;
    } else {
      // delta < 0
      // move item out from the range, exit above
      const startOfWindow = items[0].start;
      displacements[sel] =
        startOfWindow - itemLookup[sel].start - itemLookup[sel].size;
    }
  }

  //#region fix pinned
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

        const posBeforeGap = !nextItem
          ? 0
          : itemLookup[nextItem].start +
            itemLookup[nextItem].size +
            displacements[nextItem];


        iterateOverLinkedList(pinnedLinkedList, item.id, (item) => {
          size += item.size;
          numItems += 1;
          lastIndex = itemIndices[item.id];
          // FINAL STEP
          displacements[item.id] -=
            item.start + displacements[item.id] - posBeforeGap;
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
          if (!nextItem || (itemIndices[item.id] > itemIndices[nextItem])) {
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
        // FINAL STEP
      }
    }
  }
  //#endregion
  return { newIndex, newPinned: targetPinned };
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
}: {
  minDistance: MinDistance;
  displacements: Record<string, number>;
  itemIndices: Record<string, number>;
  pinned: Record<string, PinPos | false>;
  dragged: Item;
  itemLookup: Record<string, Item>;
  selected: string[];
  items: Item[];
  drag: DragInfo;
}) {
  // should move non-pinned to non-pinned
  if (!dragged.pinned && !pinned[minDistance.id]) {
    const { newIndex, newPinned } = displace({
      dragged,
      selected,
      items,
      displacements,
      itemIndices,
      itemLookup,
      minDistance,
      pinned,
    });

    return {
      displacements,
      itemIndices,
      dragged: {
        targetIndex: newIndex,
        pinned: newPinned,
      },
      pinned,
    };
  }

  // should move pinned to non-pinned
  if (dragged.pinned !== false && !pinned[minDistance.id]) {
    // let's move all items
    // const newIndex = itemLookup[minDistance.id].index;
    // selected.forEach((id) => {
    //   pinned[id] = false;
    // });
    // const prevIndex = dragged.index;
    // if (newIndex < prevIndex) {
    //   for (const item of items) {
    //     if (item.index >= newIndex && item.index < prevIndex) {
    //       displacements[item.id] += dragged.size;
    //       itemIndices[item.id] += 1;
    //     }
    //   }
    // } else {
    //   for (const item of items) {
    //     if (item.index <= newIndex) {
    //       displacements[item.id] -= dragged.size;
    //       itemIndices[item.id] -= 1;
    //     }
    //   }
    // }
    // displacements[drag.id] = itemLookup[minDistance.id].start - dragged.start;
    // itemIndices[drag.id] = newIndex;
    const { newIndex, newPinned } = displace({
      dragged,
      selected,
      items,
      displacements,
      itemIndices,
      itemLookup,
      minDistance,
      pinned,
    });
    return {
      pinned,
      displacements,
      itemIndices,
      dragged: {
        targetIndex: newIndex,
        pinned: newPinned,
      },
    };
  }

  // should move pinned to pinned
  if (dragged.pinned !== false && pinned[minDistance.id] !== false) {
    if (dragged.pinned === pinned[minDistance.id]) {
      // we are just moving pinned within pinned
      // selected.forEach((id) => {
      //   pinned[id] = dragged.pinned;
      // });
      // const newIndex = itemLookup[minDistance.id].index;
      // const prevIndex = dragged.index;
      // if (newIndex < prevIndex) {
      //   for (const item of items) {
      //     if (item.pinned !== dragged.pinned) {
      //       continue;
      //     }
      //     if (item.index >= newIndex && item.index < prevIndex) {
      //       displacements[item.id] += dragged.size;
      //       itemIndices[item.id] += 1;
      //     }
      //   }
      // } else {
      //   for (const item of items) {
      //     if (item.pinned !== dragged.pinned) {
      //       continue;
      //     }
      //     if (item.index <= newIndex) {
      //       displacements[item.id] -= dragged.size;
      //       itemIndices[item.id] -= 1;
      //     }
      //   }
      // }
      // displacements[drag.id] = itemLookup[minDistance.id].start - dragged.start;
      // itemIndices[drag.id] = newIndex;

      const { newIndex, newPinned } = displace({
        dragged,
        selected,
        items,
        displacements,
        itemIndices,
        itemLookup,
        minDistance,
        pinned,
      });

      return {
        pinned,
        displacements,
        itemIndices,
        dragged: {
          targetIndex: newIndex,
          pinned: newPinned,
        },
      };
    }
  }

  // should move non-pinned to pinned
  if (!dragged.pinned && pinned[minDistance.id] !== false) {
    // we are moving non-pinned to pinned
    // const newIndex = itemLookup[minDistance.id].index;
    // selected.forEach((id) => {
    //   pinned[id] = pinned[minDistance.id];
    // });
    // const prevIndex = dragged.index;
    // if (newIndex < prevIndex) {
    //   for (const item of items) {
    //     if (item.pinned !== pinned[minDistance.id]) {
    //       continue;
    //     }
    //     if (item.index >= newIndex && item.index < prevIndex) {
    //       displacements[item.id] += dragged.size;
    //       itemIndices[item.id] += 1;
    //     }
    //   }
    // } else {
    //   for (const item of items) {
    //     if (item.pinned !== pinned[minDistance.id]) {
    //       continue;
    //     }
    //     if (item.index <= newIndex) {
    //       displacements[item.id] -= dragged.size;
    //       itemIndices[item.id] -= 1;
    //     }
    //   }
    // }
    // displacements[drag.id] = itemLookup[minDistance.id].start - dragged.start;
    // itemIndices[drag.id] = newIndex;

    // return {
    //   pinned,
    //   displacements,
    //   itemIndices,
    //   dragged: {
    //     targetIndex: newIndex,
    //     pinned: pinned[minDistance.id],
    //   },
    // };


    const { newIndex, newPinned } = displace({
      dragged,
      selected,
      items,
      displacements,
      itemIndices,
      itemLookup,
      minDistance,
      pinned,
    });

    return {
      pinned,
      displacements,
      itemIndices,
      dragged: {
        targetIndex: newIndex,
        pinned: newPinned,
      },
    };

   
  }

  throw new Error("Not implemented");
}
