type Row = {
  index: number;
  size: number;
  id: string;
};

export function calculateDisplacement(
  rows: Row[],
  selected: Row[],
  delta: number
): Record<string, number> {
  // Initialize all displacements to 0
  const displacement: Record<string, number> = {};
  for (const r of rows) {
    displacement[r.id] = 0;
  }

  // Copy the rows into an array we can reorder
  const rowList = [...rows];

  // Sort the selected rows so we move them in a logical order
  // – If moving up (delta < 0), move the top-most selected row first
  // – If moving down (delta > 0), move the bottom-most selected row first
  const sortedSelected = [...selected];
  if (delta < 0) {
    // ascending by index
    sortedSelected.sort((a, b) => a.index - b.index);
  } else if (delta > 0) {
    // descending by index
    sortedSelected.sort((a, b) => b.index - a.index);
  }

  // Move each selected row in turn, reindexing as we go
  for (const sel of sortedSelected) {
    // Find the row in our current list
    const oldPos = rowList.findIndex((r) => r.id === sel.id);
    if (oldPos === -1) continue; // just in case

    const newPos = oldPos + delta;
    // You might want to clamp newPos to [0, rowList.length - 1] or handle out-of-bounds

    if (newPos < oldPos) {
      // We are moving 'sel' up
      // Rows in the slice [newPos .. oldPos-1] get pushed down by sel.size
      // 'sel' accumulates each crossed row's size
      for (let i = newPos; i < oldPos; i++) {
        const crossed = rowList[i];
        if (crossed.id !== sel.id) {
          displacement[crossed.id] += sel.size;
          displacement[sel.id] += crossed.size;
        }
      }
    } else if (newPos > oldPos) {
      // We are moving 'sel' down
      // Rows in the slice [oldPos+1 .. newPos] get pulled up by sel.size
      // 'sel' accumulates each crossed row's size
      for (let i = oldPos + 1; i <= newPos; i++) {
        const crossed = rowList[i];
        if (crossed.id !== sel.id) {
          displacement[crossed.id] -= sel.size;
          displacement[sel.id] += crossed.size;
        }
      }
    }

    // Finally, remove 'sel' from its old position and
    // insert it at the new position so subsequent moves see the updated layout
    rowList.splice(oldPos, 1);
    rowList.splice(newPos, 0, sel);
  }

  return displacement;
}
