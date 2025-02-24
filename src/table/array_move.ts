// 0,1,2,3,4,5,6
// a,b,c,d,e,f,g
//     *, ,*     // delta +2
// a,b,c,d, ,f,g
// a,b,c,d,f,g
// a,b, ,d,f,g
// a,b,d,f,g // removed c and e
//    *---| // inject c here +2 (index 4)
// 0,1,2,3,4,5,6
// a,b,d,f,c,g
//            * inject e here (index 6)
// a,b,d,f,c,g,e

import { Row } from "@tanstack/react-table";

/**
 * Used for moving columns
 */
export const arrayMove = <T>({
  arr,
  selected,
  delta,
  getIndex,
}: {
  arr: T[];
  selected: string[];
  delta: number;
  getIndex: (item: string) => number;
}) => {
  const newData = [...arr];

  // 1) Remove the selected rows from the data.
  for (let i = selected.length - 1; i >= 0; i--) {
    const id = selected[i];
    newData.splice(getIndex(id), 1);
  }

  for (const id of selected) {
    const originalIndex = getIndex(id);
    let targetIndex = originalIndex + delta;

    // Optionally clamp (so we don't go out of bounds):
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex > newData.length) {
      targetIndex = newData.length;
    }

    const rowToInsert = arr[originalIndex];

    // Insert it into the newData
    newData.splice(targetIndex, 0, rowToInsert);
  }

  return newData;
};

/**
 * Used for moving rows
 */
export const groupedArrayMove = <T>({
  originalData,
  flatSelected: rawFlatSelected,
  delta,
  getSubRows,
  getGroup,
  getId,
  updateSubRows,
  getExpanded,
  rootGroup,
}: {
  originalData: T[];
  flatSelected: string[];
  delta: number;
  getSubRows: (row: T) => T[];
  getGroup: (row: T) => string | undefined;
  getId: (row: T) => string;
  getExpanded: (row: T) => boolean;
  updateSubRows: (row: T, subRows: T[]) => T;
  rootGroup: string | undefined;
}) => {
  if (delta === 0) {
    return originalData;
  }
  const flatData: T[] = [];
  const attrs: {
    [id: string]: {
      parent: string | undefined;
      relativeIndex: number;
      flatIndex: number;
      groupId: string | undefined;
      item: T;
      hasSelectedAncestor: boolean;
    };
  } = {};
  const rawSelected: Record<string, boolean> = {};
  rawFlatSelected.forEach((id) => {
    rawSelected[id] = true;
  });
  function loop(
    rows: T[],
    props?: { parent?: string; hasSelectedAncestor?: boolean },
  ) {
    rows.forEach((row, index) => {
      const dataLen = flatData.push(row);
      const id = getId(row);
      attrs[id] = {
        parent: props?.parent,
        relativeIndex: index,
        flatIndex: dataLen - 1,
        groupId: getGroup(row),
        item: row,
        hasSelectedAncestor: props?.hasSelectedAncestor || false,
      };
      if (getExpanded(row)) {
        const subRows = getSubRows(row);
        loop(subRows, {
          parent: id,
          hasSelectedAncestor:
            props?.hasSelectedAncestor || rawSelected[id] || false,
        });
      }
    });
  }
  loop(originalData);

  // don't include selected rows that have a selected ancestor, because that would mean double work, only move the ancestor
  const flatSelected: string[] = rawFlatSelected.filter((id) => {
    const attr = attrs[id];
    if (attr.hasSelectedAncestor) {
      return false;
    }
    return true;
  });

  const newData = [...originalData];

  // 1) Remove the selected rows from the data.
  for (let i = flatSelected.length - 1; i >= 0; i--) {
    const id = flatSelected[i];
    const itemAttrs = attrs[id];
    const parentId = itemAttrs.parent;
    const parent =
      typeof parentId === "string" ? attrs[parentId].item : undefined;

    const list = parent ? [...getSubRows(parent)] : newData;

    list.splice(itemAttrs.relativeIndex, 1);
    flatData.splice(itemAttrs.flatIndex, 1);

    for (let i = itemAttrs.flatIndex; i < flatData.length; i++) {
      const a = attrs[getId(flatData[i])];
      // we decrease the index of all items after the removed item
      a.flatIndex -= 1;
    }
    for (let i = itemAttrs.relativeIndex; i < list.length; i++) {
      const a = attrs[getId(list[i])];
      // we decrease the index of all items after the removed item
      a.relativeIndex -= 1;
    }

    if (parent) {
      recursiveUpdateSubRows(parent, list);
    }
  }
  function recursiveUpdateSubRows(item: T, newSubRows: T[]) {
    const newItem = updateSubRows(item, newSubRows);
    attrs[getId(newItem)].item = newItem;
    const itemId = getId(item);
    const itemAttrs = attrs[itemId];
    const parentId = itemAttrs.parent;
    const parent =
      typeof parentId === "string" ? attrs[parentId].item : undefined;
    if (parent) {
      const parentSubRows = [...getSubRows(parent)];
      parentSubRows[itemAttrs.relativeIndex] = newItem;
      recursiveUpdateSubRows(parent, parentSubRows);
    } else {
      newData[itemAttrs.relativeIndex] = newItem;
      flatData[itemAttrs.flatIndex] = newItem;
    }
  }

  for (const id of flatSelected) {
    const group = attrs[id].groupId;
    const originalIndex = attrs[id].flatIndex;
    const lastIndexCandidate = originalIndex + delta;

    let candidateIndex = originalIndex;
    let targetIndex = originalIndex;

    // we need to consider the displacement as well here
    while (candidateIndex !== lastIndexCandidate) {
      candidateIndex += Math.sign(delta);
      if (candidateIndex < 0 || candidateIndex >= flatData.length) {
        break;
      }
      if (group === rootGroup && candidateIndex === 0) {
        // if we have dragged an item to the top of the list and it doesn't have a group then
        targetIndex = 0;
        break;
      }
      // get the group of the candidate
      const candidateId = getId(flatData[candidateIndex]);

      if (group === attrs[candidateId].groupId) {
        targetIndex = candidateIndex;
      }
    }

    const injectAt = flatData[targetIndex];
    const injectId = getId(injectAt);

    const injectAttrs = attrs[injectId];

    const parentId = injectAttrs.parent;
    const parent =
      typeof parentId === "string" ? attrs[parentId].item : undefined;

    const list = parent ? [...getSubRows(parent)] : newData;

    const injectAtRelativeIndex = injectAttrs.relativeIndex;
    const injectAtFlatIndex = injectAttrs.flatIndex;

    for (let i = injectAtRelativeIndex; i < list.length; i++) {
      const a = attrs[getId(list[i])];
      a.relativeIndex += 1;
    }
    for (let i = injectAtFlatIndex; i < flatData.length; i++) {
      const a = attrs[getId(flatData[i])];
      a.flatIndex += 1;
    }

    attrs[id].relativeIndex = injectAtRelativeIndex;
    attrs[id].flatIndex = injectAtFlatIndex;

    // Insert it into the newData

    const item = attrs[id].item;
    list.splice(injectAtRelativeIndex, 0, item);
    flatData.splice(injectAtFlatIndex, 0, item);
    console.log("@parent", parent);
    // return originalData;

    if (parent) {
      recursiveUpdateSubRows(parent, list);
    }
  }

  return newData;
};
