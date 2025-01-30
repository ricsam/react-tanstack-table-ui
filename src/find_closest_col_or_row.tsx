export type ColRow = { id: string };
export type ClosestResult = { id: string; index: number };

/**
 * Finds the column/row closest to `pos`.
 *
 * @param i           The start index to search from.
 * @param pos         The position to find the closest column/row to.
 * @param items       Array of items (columns/rows), each having a 'size'.
 *
 * @returns An object containing `{ size, id, index }` for the closest item.
 */
export function findClosestColOrRow(
  i: number,
  _dragStart: number,
  id: string,
  items: ColRow[],
  getSize: (id: string) => number,
  getStart: (id: string) => number,
  displacements?: Record<string, number>,
): ClosestResult {
  if (!items.length) {
    throw new Error("No items provided.");
  }
  // const dragStart = _dragStart + (displacements?.[id] ?? 0);
  const dragStart = _dragStart;
  const dragSize = getSize(id);
  const dragEnd = dragStart + dragSize;
  const dragCenter = dragStart + dragSize / 2;

  const closestCenter = (index: number) => {
    const itemStart = getStart(items[index].id);
    const itemSize = getSize(items[index].id);
    const itemEnd = itemStart + itemSize;
    const itemCenter = itemStart + itemSize / 2;
    return Math.abs(dragCenter - itemCenter);
  };
  const custom = (index: number) => {
    const itemStart =
      getStart(items[index].id) + (displacements?.[items[index].id] ?? 0);
    const itemSize = getSize(items[index].id);
    // console.log("custom", itemStart, itemSize);
    const itemEnd = itemStart + itemSize;
    const itemCenter = itemStart + itemSize / 2;

    const startDistance = Math.abs(dragStart - itemStart);
    const endDistance = Math.abs(dragEnd - itemEnd);

    // if (dragSize > itemSize) {
      return Math.min(
        Math.abs(dragStart - itemStart),
        Math.abs(dragEnd - itemEnd),
      );
    // }

    // return startDistance + endDistance;
    return Math.min(
      // Math.abs(dragStart - itemStart),
      Math.abs(dragCenter - itemCenter),
    );
  };

  // const getDistance = closestCenter;
  const getDistance = custom;

  // 3) Calculate the initial "best" distance and item
  let bestIndex = i;
  let bestDist = getDistance(i);
  let bestItem = items[i];

  // Set up left/right indices
  let left = i - 1;
  let right = i + 1;

  // We'll expand in both directions until the distance doesn't get better.
  let searchLeft = true;
  let searchRight = true;

  let numIter = 0;
  while ((searchLeft || searchRight) && numIter < 100) {
    numIter += 1;
    // ---- Search Left ----
    if (searchLeft) {
      if (left < 0) {
        // No more items on the left
        searchLeft = false;
      } else {
        const distLeft = getDistance(left);

        // console.log("left", distLeft, bestDist);
        if (distLeft <= bestDist) {
          bestDist = distLeft;
          bestIndex = left;
          bestItem = items[left];
          left--;
        } else {
          // If we didn't improve, no point continuing left
          // console.log("left", left, distLeft, bestDist);
          searchLeft = false;
        }
      }
    }

    // ---- Search Right ----
    if (searchRight) {
      if (right >= items.length) {
        // No more items on the right
        searchRight = false;
      } else {
        const distRight = getDistance(right);

        // console.log("right", right, distRight, bestDist);
        if (distRight <= bestDist) {
          bestDist = distRight;
          bestIndex = right;
          bestItem = items[right];
          right++;
        } else {
          // If we didn't improve, no point continuing right
          // console.log("right", right, distRight, bestDist);
          searchRight = false;
        }
      }
    }
  }

  // console.log(
  //   "@bestItem.id,",
  //   bestItem.id,
  //   bestDist,
  //   "guess:",
  //   items[i].id,
  //   "iterations:",
  //   numIter,
  // );
  return { id: bestItem.id, index: bestIndex };
}
