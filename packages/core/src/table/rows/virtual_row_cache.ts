import { TableState } from "@tanstack/react-table";
import { shallowEqual } from "../../utils";
import { VirtualRow } from "./table_row";

export class VirtualRowCache {
  private lastResult: VirtualRow[] | null = null;
  private prevState: TableState | null = null;

  /**
   * Updates the cache with the new header groups.
   * If nothing changes, returns the same array reference.
   * For each header group, only headers that have actually updated are new objects.
   */
  public update(newRows: VirtualRow[], state: TableState): VirtualRow[] {
    let changed = false;

    const prevState = this.prevState;
    this.prevState = state;

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

      if (
        cachedRow &&
        prevState &&
        shallowEqual(cachedRow, newRow, ["dndStyle"]) &&
        shallowEqual(cachedRow.dndStyle, newRow.dndStyle)
      ) {
        // Reuse cached header
        return cachedRow;
      }
      // Otherwise, mark that headers have changed and use the new header.
      changed = true;
      return newRow;
    });

    // Check ordering: if the new row array isn't in the same order as before, treat as changed.
    let sameOrder = true;
    if (this.lastResult.length === newRowsMapped.length) {
      for (let i = 0; i < this.lastResult.length; i++) {
        if (this.lastResult[i].row.id !== newRowsMapped[i].row.id) {
          sameOrder = false;
          break;
        }
      }
    } else {
      sameOrder = false;
    }

    if (changed || !sameOrder) {
      this.lastResult = newRowsMapped;
      return newRowsMapped;
    }

    // Final rows: if nothing changed (including order), reuse the cached rows array.
    return this.lastResult;
  }
}
