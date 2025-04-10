import { shallowEqual } from "../../utils";
import { VirtualCell, VirtualRow } from "./table_row";

export class VirtualRowCache {
  private lastResult: VirtualRow[] | null = null;

  /**
   * Updates the cache with the new header groups.
   * If nothing changes, returns the same array reference.
   * For each header group, only headers that have actually updated are new objects.
   */
  public update(newRows: VirtualRow[]): VirtualRow[] {
    let changed = false;

    if (!this.lastResult) {
      this.lastResult = newRows;
      return this.lastResult;
    }

    const cachedRowMap = new Map<string, VirtualRow>();

    this.lastResult.forEach((newRow) =>
      cachedRowMap.set(newRow.row.id, newRow),
    );

    const newRowsMapped = newRows.map((newRow) => {
      const cachedRow = cachedRowMap.get(newRow.row.id);

      if (!cachedRow) {
        return newRow;
      }

      let rowChanged =
        !shallowEqual(cachedRow, newRow, ["cells", "dndStyle"]) ||
        !shallowEqual(cachedRow.dndStyle, newRow.dndStyle);

      const cachedCellMap = new Map<string, VirtualCell>();
      cachedRow.cells.forEach((c) => cachedCellMap.set(c.cell.id, c));

      let cellsChanged = false;

      const newCellsMapped = newRow.cells.map((newCell) => {
        const cachedCell = cachedCellMap.get(newCell.cell.id);

        if (
          cachedCell &&
          shallowEqual(cachedCell, newCell, ["dndStyle"]) &&
          shallowEqual(cachedCell.dndStyle, newCell.dndStyle)
        ) {
          return cachedCell;
        }

        // Otherwise, mark that headers have changed and use the new header.
        cellsChanged = true;
        return newCell;
      });

      if (!cellsChanged) {
        if (cachedRow.cells.length === newCellsMapped.length) {
          for (let i = 0; i < newCellsMapped.length; i++) {
            if (cachedRow.cells[i].cell.id !== newCellsMapped[i].cell.id) {
              cellsChanged = true;
              break;
            }
          }
        } else {
          cellsChanged = true;
        }
      }

      let finalCells = cachedRow.cells;
      if (cellsChanged) {
        rowChanged = true;
        finalCells = newCellsMapped;
      }

      if (rowChanged) {
        const updatedRow: VirtualRow = {
          ...newRow,
          cells: finalCells,
        };
        changed = true;
        return updatedRow;
      }

      return cachedRow;
    });

    if (!changed) {
      if (this.lastResult.length === newRowsMapped.length) {
        for (let i = 0; i < this.lastResult.length; i++) {
          if (this.lastResult[i].row.id !== newRowsMapped[i].row.id) {
            changed = true;
            break;
          }
        }
      } else {
        changed = true;
      }
    }

    if (changed) {
      this.lastResult = newRowsMapped;
      return newRowsMapped;
    }

    return this.lastResult;
  }
}
