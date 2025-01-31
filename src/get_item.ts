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
): Record<string, number> {
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

  const getIndexForStart = (position: number) => {
    let minDistance = Infinity;
    let bestIndex = 0;
    Object.entries(newItemIndices).forEach(([id, index]) => {
      const item = itemRecord[id];
      const itemStart = item.start + displacements[id];
      const itemSize = item.size;
      const itemEnd = itemStart + itemSize;
      const itemCenter = itemStart + itemSize / 2;
      const distance = Math.abs(position - itemCenter);
      if (distance < minDistance) {
        minDistance = distance;
        bestIndex = index;
      }
    });
    return bestIndex;
  };

  // "inject" the items
  // first inject a selected item and then displace the items after it
  for (const sel of selectedItems) {
    // const newItemIndex = sel.index + delta;
    // get the start for the index where we will inject the dragged item
    const newItemIndex = getIndexForStart(sel.start + delta);
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

  return displacements;
}
