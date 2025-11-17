import { SMArea } from "@ricsam/selection-manager";

export interface SourceRange {
  start: { row: number; col: number };
  end: { row: number; col: number };
}

/**
 * Maps a visual selection area (from SelectionManager) to source data ranges.
 * When rows are sorted/filtered or columns reordered, a contiguous visual selection
 * may map to multiple non-contiguous source data ranges.
 *
 * @param area - The visual selection area from SelectionManager
 * @param visualToSourceRow - Function that maps visual row index to source row index (throws if not found)
 * @param visualToSourceCol - Function that maps visual column index to source column index (throws if not found)
 * @param maxRows - Maximum number of rows in the data source
 * @param maxCols - Maximum number of columns in the data source
 * @returns Array of source data ranges (may be multiple ranges if non-contiguous)
 */
export function mapSmAreaToSourceRanges(
  area: SMArea,
  visualToSourceRow: (visualRow: number) => number,
  visualToSourceCol: (visualCol: number) => number,
  maxRows: number,
  maxCols: number,
): SourceRange[] {
  const startRow = area.start.row;
  const endRow =
    area.end.row.type === "infinity" ? maxRows - 1 : area.end.row.value;
  const startCol = area.start.col;
  const endCol =
    area.end.col.type === "infinity" ? maxCols - 1 : area.end.col.value;

  const cells: Array<{ row: number; col: number }> = [];

  for (let visualRow = startRow; visualRow <= endRow; visualRow++) {
    const sourceRow = visualToSourceRow(visualRow); // throws if not found

    for (let visualCol = startCol; visualCol <= endCol; visualCol++) {
      const sourceCol = visualToSourceCol(visualCol); // throws if not found
      cells.push({ row: sourceRow, col: sourceCol });
    }
  }

  if (cells.length === 0) return [];
  cells.sort((a, b) => a.row - b.row || a.col - b.col);
  return mergeIntoRanges(cells);
}

/**
 * Checks if the visual range maps to consecutive source rows.
 * This is used to validate fill operations - fills should only work on consecutive data.
 *
 * @param visualRange - The visual selection area
 * @param visualToSourceRow - Function that maps visual row index to source row index
 * @param maxRows - Maximum number of rows
 * @returns true if all source rows are consecutive (no gaps), false otherwise
 */
export function areRowsConsecutive(
  visualRange: SMArea,
  visualToSourceRow: (visualRow: number) => number,
  maxRows: number,
): boolean {
  const startRow = visualRange.start.row;
  const endRow =
    visualRange.end.row.type === "infinity" ? maxRows - 1 : visualRange.end.row.value;

  const sourceRows: number[] = [];
  for (let vRow = startRow; vRow <= endRow; vRow++) {
    sourceRows.push(visualToSourceRow(vRow));
  }

  sourceRows.sort((a, b) => a - b);
  for (let i = 1; i < sourceRows.length; i++) {
    if (sourceRows[i] !== sourceRows[i - 1] + 1) {
      return false; // gap found - not consecutive
    }
  }
  return true;
}

/**
 * Merges sorted cells into rectangular ranges.
 * Cells must be sorted by row then column before calling this function.
 *
 * @param sortedCells - Array of cells sorted by row, then column
 * @returns Array of merged rectangular ranges
 */
function mergeIntoRanges(
  sortedCells: Array<{ row: number; col: number }>,
): SourceRange[] {
  if (sortedCells.length === 0) return [];

  const ranges: SourceRange[] = [];
  let currentRange: SourceRange = {
    start: { ...sortedCells[0] },
    end: { ...sortedCells[0] },
  };

  for (let i = 1; i < sortedCells.length; i++) {
    const cell = sortedCells[i];
    const prevCell = sortedCells[i - 1];

    // Check if this cell extends the current range
    // Case 1: Same row, next column
    if (cell.row === prevCell.row && cell.col === prevCell.col + 1) {
      currentRange.end.col = cell.col;
    }
    // Case 2: Next row, same column range
    else if (
      cell.row === prevCell.row + 1 &&
      cell.col === currentRange.start.col &&
      currentRange.start.col === currentRange.end.col
    ) {
      currentRange.end.row = cell.row;
    }
    // Case 3: Next row in a multi-column range - check if it continues the rectangle
    else if (
      cell.row === currentRange.end.row + 1 &&
      cell.col === currentRange.start.col
    ) {
      // Check if the rest of this row matches the column range
      let matches = true;
      const colSpan = currentRange.end.col - currentRange.start.col + 1;
      for (let j = 0; j < colSpan && i + j < sortedCells.length; j++) {
        const checkCell = sortedCells[i + j];
        if (
          checkCell.row !== cell.row ||
          checkCell.col !== currentRange.start.col + j
        ) {
          matches = false;
          break;
        }
      }
      if (matches) {
        currentRange.end.row = cell.row;
        i += colSpan - 1; // Skip the cells we just validated
      } else {
        // Start new range
        ranges.push(currentRange);
        currentRange = {
          start: { ...cell },
          end: { ...cell },
        };
      }
    } else {
      // Can't extend current range, start a new one
      ranges.push(currentRange);
      currentRange = {
        start: { ...cell },
        end: { ...cell },
      };
    }
  }

  // Don't forget the last range
  ranges.push(currentRange);

  return ranges;
}

