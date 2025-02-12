import { ColumnPinningPosition } from "@tanstack/table-core";

export interface Item {
  index: number;
  id: string;
  start: number; // pixel position
  size: number; // pixel size
}

export function calculateDisplacements(
  inRangeItems: Item[],
  selectedItems: Item[],
  delta: number,
) {
  const selectedIds = new Set(selectedItems.map((r) => r.id));

  const displacements: Record<string, number> = {};
  for (const r of inRangeItems) {
    displacements[r.id] = 0;
  }

  const newItemIndices: Record<string, number> = {};
  const itemRecord: Record<string, Item> = {};
  inRangeItems.forEach((item) => {
    if (selectedIds.has(item.id)) {
      return;
    }
    newItemIndices[item.id] = item.index;
    itemRecord[item.id] = item;
  });
  for (const sel of selectedItems) {
    itemRecord[sel.id] = sel;
  }

  // "remove" the items
  // do it in reverse to avoid index shifting
  for (let i = selectedItems.length - 1; i >= 0; i--) {
    const sel = selectedItems[i];
    inRangeItems.forEach((item) => {
      if (newItemIndices[item.id] >= sel.index) {
        newItemIndices[item.id] -= 1;
        displacements[item.id] -= sel.size;
      }
    });
  }

  /**
   * When injecting the selected items we need to know where in pixel it should be placed,
   * i.e. which dipslacement it should have.
   *
   * That should be based on the start of the item that is currently residing at
   * the index where the selected item should be placed.
   */
  const getStartForIndex = (index: number) => {
    const newIndexMap: Record<string, string> = Object.fromEntries(
      Object.entries(newItemIndices).map(([id, index]) => [index, id]),
    );
    let id;

    id = newIndexMap[index];
    if (typeof id !== "undefined") {
      return itemRecord[id].start + displacements[id];
    }
    id = newIndexMap[index - 1];
    if (typeof id !== "undefined") {
      return itemRecord[id].start + itemRecord[id].size + displacements[id];
    }

    return undefined;
  };

  // "inject" the items
  // first inject a selected item and then displace the items after it
  for (const sel of selectedItems) {
    const newItemIndex = sel.index + delta;
    // get the start for the index where we will inject the dragged item
    const newItemStart = getStartForIndex(newItemIndex);

    if (typeof newItemStart === "number") {
      // add the moved item to the newItemIndex object so adjacent moved items can reference it in getStartForIndex
      newItemIndices[sel.id] = newItemIndex;

      // the item should be displaced by the delta between the new pos and the original pos
      displacements[sel.id] = newItemStart - sel.start;
    } else if (delta > 0) {
      // move item out from the range, exit bellow
      const endOfWindow =
        inRangeItems[inRangeItems.length - 1].start +
        inRangeItems[inRangeItems.length - 1].size;
      displacements[sel.id] = endOfWindow - sel.start;
    } else {
      // delta < 0
      // move item out from the range, exit above
      const startOfWindow = inRangeItems[0].start;
      displacements[sel.id] = startOfWindow - sel.start - sel.size;
    }

    // any item that is after the new item should be displaced by the size of the dragged item
    inRangeItems.forEach((item) => {
      if (item.id === sel.id) {
        return;
      }
      if (newItemIndices[item.id] >= newItemIndex) {
        newItemIndices[item.id] += 1;
        displacements[item.id] += sel.size;
      }
    });
  }

  return { displacements, newItemIndices };
}

/**
 * The distance between the cursor and the center of the dragged item.
 */
const getDroppedPosToCursorDistance = (
  draggedId: string,
  pointerPosition: number,
  itemRecord: Record<string, Item>,
  displacements: Record<string, number>,
  newItemIndices: Record<string, number>,
) => {
  const index = newItemIndices[draggedId];
  const item = itemRecord[draggedId];
  const itemStart = item.start + displacements[draggedId];
  const itemSize = item.size;
  const itemCenter = itemStart + itemSize / 2;

  return {
    bestIndex: index,
    bestId: draggedId,
    minDistance: Math.abs(pointerPosition - itemCenter),
  };
};

/**
 * Displace all items by different deltas and find the delta that minimizes
 * the distance between the cursor and the center of the dragged item.
 */
export const findDeltaAtPosition = ({
  lastIndex,
  draggedId,
  inRangeItems,
  selectedItems,
  cursorPosition,
  estimatedDelta,
}: {
  /**
   * last index of the all rows
   */
  lastIndex: number;
  draggedId: string;
  inRangeItems: Item[];
  /**
   * The selected items that are being dragged
   */
  selectedItems: Item[];
  /**
   * The center of the dragged item + the distance the mouse has moved while dragging
   */
  cursorPosition: number;
  /**
   * An approximation of how many indices the dragged item has moved
   */
  estimatedDelta: number;
}) => {
  // console.log(itemTablePos, pinnedLeft);
  const selectedIds = new Set(selectedItems.map((r) => r.id));
  const itemRecord: Record<string, Item> = {};
  inRangeItems.forEach((item) => {
    if (selectedIds.has(item.id)) {
      return;
    }
    itemRecord[item.id] = item;
  });
  for (const sel of selectedItems) {
    itemRecord[sel.id] = sel;
  }

  let distance = Infinity;
  let bestDelta = estimatedDelta;

  const checkDelta = (delta: number) => {
    const { displacements, newItemIndices } = calculateDisplacements(
      inRangeItems,
      selectedItems,
      delta,
    );
    const result = getDroppedPosToCursorDistance(
      draggedId,
      cursorPosition,
      itemRecord,
      displacements,
      newItemIndices,
    );
    if (result.minDistance < distance) {
      distance = result.minDistance;
      bestDelta = delta;
    }
  };

  const deltaRange = deltaScanRange({
    selected: selectedItems,
    delta: estimatedDelta,
    numToScan: 10,
    lastIndex,
  });

  console.log("@deltaRange", {
    inRangeItems,
    estimatedDelta,
    selectedItems,
    deltaRange,
  });

  if (
    estimatedDelta >= deltaRange.min + estimatedDelta &&
    estimatedDelta <= estimatedDelta + deltaRange.max
  ) {
    checkDelta(estimatedDelta);
  }

  for (
    let delta = deltaRange.min + estimatedDelta;
    delta <= estimatedDelta + deltaRange.max;
    delta++
  ) {
    if (delta === estimatedDelta) {
      continue;
    }
    checkDelta(delta);
  }

  // if (pinned) {
  //   return {
  //     delta: bestDelta,
  //     pinned,
  //     index: bestPinnedIndex,
  //   };
  // }

  return {
    delta: bestDelta,
    distance,
  };
};

/**
 * by default min = -5, max = +5
 */
export const deltaScanRange = ({
  selected,
  delta,
  numToScan,
  lastIndex,
}: {
  selected: Item[];
  /**
   * An approximation of how many indices the dragged item has moved
   */
  delta: number;
  numToScan: number;
  lastIndex: number;
}) => {
  const mid = Math.floor(numToScan / 2);
  let minDeltaScan = -mid;
  let maxDeltaScan = mid;

  const minSelected = selected[0].index;
  const maxSelected = selected[selected.length - 1].index;
  const maxIndex = lastIndex;
  const minIndex = 0;

  let negativeScan = minSelected + delta + minDeltaScan;
  let positiveScan = maxSelected + delta + maxDeltaScan;

  const limitMoveLeft = negativeScan < minIndex;
  const limitMoveRight = positiveScan > maxIndex;

  if (limitMoveLeft && limitMoveRight) {
    // we can't add extras to min nor max
  } else if (limitMoveLeft) {
    // add extra to right scan
    maxDeltaScan += minIndex - negativeScan;
  } else if (limitMoveRight) {
    // add extra to left scan
    minDeltaScan -= positiveScan - maxIndex;
  }

  negativeScan = minSelected + delta + minDeltaScan;
  // we can't move the minSelected below 0
  if (negativeScan < minIndex) {
    const positionsToAppend = minIndex - negativeScan;
    minDeltaScan += positionsToAppend;
  }

  positiveScan = maxSelected + delta + maxDeltaScan;
  // we can't move the maxSelected beyond the last row index
  if (positiveScan > maxIndex) {
    const positionsToRemove = positiveScan - maxIndex;
    maxDeltaScan -= positionsToRemove;
  }

  return { min: minDeltaScan, max: maxDeltaScan };
};
