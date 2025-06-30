import { Cell } from "@tanstack/react-table";
import { RttuiSelection } from "./types";

export class SelectionManager {
  allRowsSelected: number[] = [];
  allColsSelected: number[] = [];
  allCellsSelected = false;
  tableHasFocus = false;
  selections: RttuiSelection[] = [];
  isEditing?: string;
  isSelecting?: RttuiSelection & {
    type: "drag" | "add" | "remove" | "shift";
  };

  constructor(
    private updateRttuiTable: () => void,
    private getNumRows: () => number,
    private getNumCols: () => number,
    private getCell: (row: number, col: number) => Cell<any, any> | undefined,
  ) {}

  startSelection(
    row: number,
    col: number,
    keys: { shiftKey: boolean; ctrlKey: boolean },
  ) {
    const lastSelection = this.selections[this.selections.length - 1];
    if (keys.shiftKey && lastSelection) {
      this.selections.splice(this.selections.length - 1, 1);
      this.isSelecting = { ...lastSelection, type: "shift" };
      this.isSelecting.end = { row, col };
    } else if (keys.ctrlKey) {
      this.isSelecting = {
        start: { row, col },
        end: { row, col },
        type: this.isSelected({ row, col }) ? "remove" : "add",
      };
    } else {
      this.isSelecting = {
        start: { row, col },
        end: { row, col },
        type: "drag",
      };
      this.selections = [];
    }
    this.updateRttuiTable();
  }

  endSelection(row: number, col: number) {
    if (this.isSelecting) {
      this.isSelecting.end = { row, col };
      if (this.isSelecting.type === "remove") {
        this.deselectArea(this.isSelecting);
      } else {
        this.selections.push(this.isSelecting);
      }
    }
    this.isSelecting = undefined;
    this.updateRttuiTable();
  }

  expandSelection(row: number, col: number) {
    if (this.isSelecting) {
      this.isSelecting.end = { row, col };
    }
    this.updateRttuiTable();
  }

  cellInSelection(
    cell: { row: number; col: number },
    selection: RttuiSelection,
  ): boolean {
    const { start, end } = selection;
    const startRow = Math.min(start.row, end.row);
    const startCol = Math.min(start.col, end.col);
    const endRow = Math.max(start.row, end.row);
    const endCol = Math.max(start.col, end.col);
    return (
      cell.row >= startRow &&
      cell.row <= endRow &&
      cell.col >= startCol &&
      cell.col <= endCol
    );
  }

  deselectArea(areaToDeselect: RttuiSelection) {
    const newSelections: RttuiSelection[] = [];

    this.selections.forEach((selection) => {
      // Check if this selection overlaps with the area to deselect
      if (this.selectionsOverlap(selection, areaToDeselect)) {
        // Split this selection around the deselected area
        const remainingParts = this.subtractSelection(
          selection,
          areaToDeselect,
        );
        newSelections.push(...remainingParts);
      } else {
        // This selection doesn't overlap, keep it as is
        newSelections.push(selection);
      }
    });

    this.selections = newSelections;
  }

  private selectionsOverlap(a: RttuiSelection, b: RttuiSelection): boolean {
    const aMinRow = Math.min(a.start.row, a.end.row);
    const aMaxRow = Math.max(a.start.row, a.end.row);
    const aMinCol = Math.min(a.start.col, a.end.col);
    const aMaxCol = Math.max(a.start.col, a.end.col);

    const bMinRow = Math.min(b.start.row, b.end.row);
    const bMaxRow = Math.max(b.start.row, b.end.row);
    const bMinCol = Math.min(b.start.col, b.end.col);
    const bMaxCol = Math.max(b.start.col, b.end.col);

    return !(
      aMaxRow < bMinRow ||
      aMinRow > bMaxRow ||
      aMaxCol < bMinCol ||
      aMinCol > bMaxCol
    );
  }

  private subtractSelection(
    original: RttuiSelection,
    toRemove: RttuiSelection,
  ): RttuiSelection[] {
    const origMinRow = Math.min(original.start.row, original.end.row);
    const origMaxRow = Math.max(original.start.row, original.end.row);
    const origMinCol = Math.min(original.start.col, original.end.col);
    const origMaxCol = Math.max(original.start.col, original.end.col);

    const removeMinRow = Math.min(toRemove.start.row, toRemove.end.row);
    const removeMaxRow = Math.max(toRemove.start.row, toRemove.end.row);
    const removeMinCol = Math.min(toRemove.start.col, toRemove.end.col);
    const removeMaxCol = Math.max(toRemove.start.col, toRemove.end.col);

    const remaining: RttuiSelection[] = [];

    // Top rectangle (above the removed area)
    if (origMinRow < removeMinRow) {
      remaining.push({
        start: { row: origMinRow, col: origMinCol },
        end: { row: Math.min(removeMinRow - 1, origMaxRow), col: origMaxCol },
      });
    }

    // Bottom rectangle (below the removed area)
    if (origMaxRow > removeMaxRow) {
      remaining.push({
        start: { row: Math.max(removeMaxRow + 1, origMinRow), col: origMinCol },
        end: { row: origMaxRow, col: origMaxCol },
      });
    }

    // Left rectangle (to the left of the removed area, within the vertical bounds of overlap)
    if (origMinCol < removeMinCol) {
      const topRow = Math.max(origMinRow, removeMinRow);
      const bottomRow = Math.min(origMaxRow, removeMaxRow);
      if (topRow <= bottomRow) {
        remaining.push({
          start: { row: topRow, col: origMinCol },
          end: { row: bottomRow, col: Math.min(removeMinCol - 1, origMaxCol) },
        });
      }
    }

    // Right rectangle (to the right of the removed area, within the vertical bounds of overlap)
    if (origMaxCol > removeMaxCol) {
      const topRow = Math.max(origMinRow, removeMinRow);
      const bottomRow = Math.min(origMaxRow, removeMaxRow);
      if (topRow <= bottomRow) {
        remaining.push({
          start: { row: topRow, col: Math.max(removeMaxCol + 1, origMinCol) },
          end: { row: bottomRow, col: origMaxCol },
        });
      }
    }

    return remaining;
  }

  isSelected(cell: { row: number; col: number }) {
    const { row, col } = cell;

    if (
      row < 0 ||
      col < 0 ||
      row >= this.getNumRows() ||
      col >= this.getNumCols()
    ) {
      return false;
    }

    if (this.allCellsSelected) {
      return true;
    }

    if (this.allRowsSelected.includes(col)) {
      return true;
    }

    if (this.allColsSelected.includes(row)) {
      return true;
    }

    return this.selections.some((selection) =>
      this.cellInSelection(cell, selection),
    );
  }

  selectionBorders(cell: { row: number; col: number }): Border[] {
    const { row, col } = cell;
    const borders: Border[] = [];
    if (!this.isSelected(cell)) {
      return borders;
    }
    if (this.allCellsSelected) {
      if (row === 0) {
        borders.push("top");
      }
      if (row === this.getNumRows() - 1) {
        borders.push("bottom");
      }
      if (col === 0) {
        borders.push("left");
      }
      if (col === this.getNumCols() - 1) {
        borders.push("right");
      }
      return borders;
    } else {
      const surroundingCells = [
        [{ row: row - 1, col }, "top"],
        [{ row: row + 1, col }, "bottom"],
        [{ row, col: col - 1 }, "left"],
        [{ row, col: col + 1 }, "right"],
      ] as const;
      surroundingCells.forEach(([cell, border]) => {
        if (!this.isSelected(cell)) {
          borders.push(border);
        }
      });
    }
    return borders;
  }

  inNegativeSelection(cell: { row: number; col: number }) {
    const isSelecting = this.isSelecting;
    if (!isSelecting) {
      return false;
    }
    return (
      isSelecting.type === "remove" && this.cellInSelection(cell, isSelecting)
    );
  }

  currentSelectionBorders(cell: { row: number; col: number }): Border[] {
    const borders: Border[] = [];
    const selection = this.isSelecting;
    if (selection && this.cellInSelection(cell, selection)) {
      const minRow = Math.min(selection.start.row, selection.end.row);
      const maxRow = Math.max(selection.start.row, selection.end.row);
      const minCol = Math.min(selection.start.col, selection.end.col);
      const maxCol = Math.max(selection.start.col, selection.end.col);
      if (cell.row === minRow) {
        borders.push("top");
      }
      if (cell.row === maxRow) {
        borders.push("bottom");
      }
      if (cell.col === minCol) {
        borders.push("left");
      }
      if (cell.col === maxCol) {
        borders.push("right");
      }
    }
    return borders;
  }

  handleKeyDown(event: KeyboardEvent) {
    // handle escape key
    if (event.key === "Escape") {
      const current = {
        isSelecting: this.isSelecting,
        selections: this.selections,
      };
      this.isSelecting = undefined;
      this.selections = [];

      let shouldRerender = false;

      if (current.isSelecting !== undefined) {
        shouldRerender = true;
      }

      if (current.selections.length > 0) {
        shouldRerender = true;
      }

      if (shouldRerender) {
        this.updateRttuiTable();
      }
      return;
    }

    // handle cmd + shift + arrow key to select all cells in the direction of the arrow key
    if (
      (event.metaKey || event.ctrlKey) &&
      event.shiftKey &&
      (event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight")
    ) {
      let shouldRerender = false;
      const lastSelection = this.selections[this.selections.length - 1];
      if (!lastSelection) {
        return;
      }
      if (event.key === "ArrowUp") {
        if (lastSelection.end.row > 0) {
          lastSelection.end.row = 0;
          shouldRerender = true;
        }
      }
      if (event.key === "ArrowDown") {
        if (lastSelection.end.row < this.getNumRows() - 1) {
          lastSelection.end.row = this.getNumRows() - 1;
          shouldRerender = true;
        }
      }
      if (event.key === "ArrowLeft") {
        if (lastSelection.end.col > 0) {
          lastSelection.end.col = 0;
          shouldRerender = true;
        }
      }
      if (event.key === "ArrowRight") {
        if (lastSelection.end.col < this.getNumCols() - 1) {
          lastSelection.end.col = this.getNumCols() - 1;
          shouldRerender = true;
        }
      }
      if (shouldRerender) {
        this.updateRttuiTable();
      }
      return;
    }

    // handle arrow keys for navigation and selection
    if (
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight"
    ) {
      let shouldRerender = false;

      // Get the current active position (start of last selection, or 0,0 if no selection)
      const lastSelection = this.selections[this.selections.length - 1];
      const currentRow = lastSelection
        ? lastSelection[event.shiftKey ? "end" : "start"].row
        : 0;
      const currentCol = lastSelection
        ? lastSelection[event.shiftKey ? "end" : "start"].col
        : 0;

      // Calculate new position based on arrow key
      let newRow = currentRow;
      let newCol = currentCol;

      if (event.key === "ArrowUp" && newRow > 0) {
        newRow--;
      } else if (event.key === "ArrowDown" && newRow < this.getNumRows() - 1) {
        newRow++;
      } else if (event.key === "ArrowLeft" && newCol > 0) {
        newCol--;
      } else if (event.key === "ArrowRight" && newCol < this.getNumCols() - 1) {
        newCol++;
      }

      console.log("@currentRow", currentRow, "@newRow", newRow);

      // If position changed
      if (newRow !== currentRow || newCol !== currentCol) {
        if (event.shiftKey && lastSelection) {
          // Extend current selection
          lastSelection.end = { row: newRow, col: newCol };
          shouldRerender = true;
        } else {
          // Create new single-cell selection
          this.selections = [
            {
              start: { row: newRow, col: newCol },
              end: { row: newRow, col: newCol },
            },
          ];
          shouldRerender = true;
        }
      }

      if (shouldRerender) {
        this.updateRttuiTable();
      }
    }
  }
  selectionToTsv() {
    const cellValues: Map<
      string,
      { row: number; col: number; value: unknown }
    > = new Map();
    this.selections.forEach((selection) => {
      const startRow = Math.min(selection.start.row, selection.end.row);
      const endRow = Math.max(selection.start.row, selection.end.row);
      const startCol = Math.min(selection.start.col, selection.end.col);
      const endCol = Math.max(selection.start.col, selection.end.col);
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const cell = this.getCell(row, col);
          if (cell) {
            cellValues.set(`${row},${col}`, {
              row,
              col,
              value: cell.getValue(),
            });
          }
        }
      }
    });

    // Group cells by row
    const rowsMap = new Map<number, Map<number, unknown>>();
    cellValues.forEach((cellData) => {
      if (!rowsMap.has(cellData.row)) {
        rowsMap.set(cellData.row, new Map());
      }
      rowsMap.get(cellData.row)!.set(cellData.col, cellData.value);
    });

    // Convert to TSV format with proper row/column structure
    const sortedRows = Array.from(rowsMap.keys()).sort((a, b) => a - b);
    const tsvRows = sortedRows.map((rowIndex) => {
      const rowCells = rowsMap.get(rowIndex)!;
      const sortedCols = Array.from(rowCells.keys()).sort((a, b) => a - b);
      return sortedCols
        .map((colIndex) => rowCells.get(colIndex) ?? "")
        .join("\t");
    });

    return tsvRows.join("\n");
  }

  hasSelection() {
    return this.selections.length > 0;
  }

  focus() {
    const prev = this.tableHasFocus;
    this.tableHasFocus = true;
    if (prev !== this.tableHasFocus) {
      this.updateRttuiTable();
    }
  }

  blur() {
    const prev = this.tableHasFocus;
    this.tableHasFocus = false;
    if (prev !== this.tableHasFocus) {
      this.updateRttuiTable();
    }
  }

  hasFocus() {
    return this.tableHasFocus;
  }
}

type Border = "left" | "right" | "top" | "bottom";
