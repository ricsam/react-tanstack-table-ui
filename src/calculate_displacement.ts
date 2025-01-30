export type Row = {
  index: number;
  size: number;
  id: string;
  start: number;
};

export type WindowRange = {
  index: [number, number];
  start: [number, number];
};

export function calculateDisplacement(
  rows: Row[],
  selected: Row[],
  delta: number,
  range?: WindowRange,
): Record<string, number> {
  // Initialize all displacements to 0
  const displacement: Record<string, number> = {};
  for (const r of rows) {
    displacement[r.id] = 0;
  }
  for (const r of selected) {
    displacement[r.id] = 0;
  }

  if (delta === 0) return displacement;

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

  const selectedIds = new Set(selected.map((r) => r.id));

  // Move each selected row in turn, reindexing as we go
  for (const sel of sortedSelected) {
    if (range && (sel.index > range.index[1] || sel.index < range.index[0])) {
      const inRangeDelta = sel.index + delta - range.index[0];
      if (inRangeDelta < 0) {
        // We are moving 'sel' up
        // Rows in the slice [newPos .. oldPos-1] get pushed down by sel.size
        // 'sel' accumulates each crossed row's size
        displacement[sel.id] -= sel.start - range.start[1];
        for (let i = inRangeDelta; i < rows.length; i++) {
          const crossed = rowList[i];
          displacement[crossed.id] += sel.size;
          displacement[sel.id] -= crossed.size;
        }
      } else if (inRangeDelta >= 0) {
        displacement[sel.id] += range.start[0] - sel.start - sel.size;
        let extra = 0;
        for (let i = 0; i <= inRangeDelta + extra; i++) {
          const id = rowList[i].id;
          if (selectedIds.has(id)) {
            extra++;
            continue;
          }
          const crossed = rowList[i];
          displacement[sel.id] += crossed.size;
          displacement[crossed.id] -= sel.size;
        }
        console.log(displacement);
      }
      continue;
    }
    const oldPos = rowList.findIndex((r) => r.id === sel.id);
    if (oldPos === -1) continue; // just in case

    const newPos = Math.min(Math.max(oldPos + delta, 0), rowList.length - 1);
    // You might want to clamp newPos to [0, rowList.length - 1] or handle out-of-bounds

    if (delta < 0) {
      // We are moving 'sel' up
      // Rows in the slice [newPos .. oldPos-1] get pushed down by sel.size
      // 'sel' accumulates each crossed row's size
      for (let i = newPos; i < oldPos; i++) {
        const crossed = rowList[i];
        if (crossed.id !== sel.id) {
          displacement[crossed.id] += sel.size;
          displacement[sel.id] -= crossed.size;
        }
      }
    } else if (delta > 0) {
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
