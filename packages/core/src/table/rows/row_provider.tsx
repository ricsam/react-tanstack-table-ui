import React, { CSSProperties } from "react";
import {
  defaultRangeExtractor,
  measureElement,
  Range,
  useVirtualizer,
  Virtualizer,
} from "@tanstack/react-virtual";
import { useColContext } from "../cols/col_context";
import { useTableContext } from "../table_context";
import { RowContext } from "./row_context";

export const RowProvider = ({ children }: { children: React.ReactNode }) => {
  const [draggedRowId, setDraggedRowId] = React.useState<string | null>(null);

  const { table, tableContainerRef, skin } = useTableContext();

  let draggedRows: string[] | undefined;

  if (draggedRowId) {
    const expandedRowIds = new Set<string>();

    const draggedRow = table.getRow(draggedRowId);

    if (draggedRow.getIsSelected()) {
      table.getSelectedRowModel().flatRows.forEach((r) => {
        expandedRowIds.add(r.id);
      });
    } else {
      const appendChildren = (rowId: string) => {
        const row = table.getRow(rowId);
        if (row.getIsExpanded()) {
          row.subRows.forEach((r) => {
            expandedRowIds.add(r.id);
            appendChildren(r.id);
          });
        }
      };
      expandedRowIds.add(draggedRowId);
      appendChildren(draggedRowId);
    }

    draggedRows = [...expandedRowIds];
    console.log("@draggedRows", draggedRows);
  }

  const { mainHeaderGroup, headerGroups, footerGroups } = useColContext();

  const { rows } = table.getRowModel();
  const rowIds = React.useMemo(() => {
    return rows.map((row) => row.id);
  }, [rows]);

  const _refs = { table, rowIds };
  const refs = React.useRef(_refs);
  refs.current = _refs;


  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: React.useCallback(() => skin.rowHeight, [skin.rowHeight]),
    getItemKey: React.useCallback((index: number) => rowIds[index], [rowIds]),
    getScrollElement: () => tableContainerRef.current,
    measureElement: React.useCallback(
      (
        element: any,
        entry: ResizeObserverEntry | undefined,
        instance: Virtualizer<HTMLDivElement, any>,
      ) => {
        const defaultSize = measureElement(element, entry, instance);
        return Math.max(defaultSize, skin.rowHeight);
      },
      [skin.rowHeight],
    ),
    overscan: 5,
    rangeExtractor: React.useCallback(
      (range: Range): number[] => {
        const defaultRange = defaultRangeExtractor(range);
        const next = new Set(defaultRange);

        [...table.getTopRows(), ...table.getBottomRows()].forEach((row) => {
          next.add(rowIds.indexOf(row.id));
        });

        const n = [...next].sort((a, b) => a - b);
        return n;
      },
      [rowIds, table],
    ),
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const { offsetTop, offsetBottom } = getRowVirtualizedOffsets({
    virtualColumns: virtualRows,
    getIsPinned(vcIndex) {
      const row = rows[vcIndex];
      return !!row.getIsPinned();
    },
    totalSize: rowVirtualizer.getTotalSize(),
  });

  return (
    <RowContext.Provider
      value={{
        moveResult: null,
        rowIds,
        getStart(rowId) {
          const row = table.getRow(rowId);
          return rowVirtualizer.measurementsCache[row.index].start;
        },
        rows: rowVirtualizer.getVirtualItems().map((item) => {
          const row = rows[item.index];
          const pinned = row.getIsPinned();
          const dndStyle: CSSProperties = {};

          return {
            row,
            flatIndex: rowIds.indexOf(row.id),
            isDragging: false,
            isPinned:
              pinned === "bottom" ? "end" : pinned === "top" ? "start" : false,
            dndStyle,
          };
        }),
        setIsDragging(dragState) {
          // to be implemented
        },
        rowVirtualizer,
        offsetTop,
        offsetBottom,
        mainHeaderGroup: mainHeaderGroup,
        headerGroups,
        footerGroups,
      }}
    >
      {children}
    </RowContext.Provider>
  );
};

/**
 * when we are only rendering a window of columns while maintaining a scrollbar we need to move the elements as we remove elements to the left
 * we are assuming that the columns are rendered in order, so pinned left, followed by non-pinned, followed by pinned right
 */
function getRowVirtualizedOffsets({
  virtualColumns,
  getIsPinned,
  totalSize,
}: {
  virtualColumns: { index: number; start: number; end: number; size: number }[];
  getIsPinned: (vcIndex: number) => boolean;
  totalSize: number;
}) {
  //   offset     window     offset
  // |--------|------------|--------|
  //          s            e
  // any pinned columns that are part of the offset were never rendered, thus they should be ommited from the offset

  let offsetTop = 0;
  let offsetBottom = 0;

  // offsetTop
  {
    let pinnedTotalSize = 0;
    let firstNonPinned: undefined | number;

    for (let i = 0; i < virtualColumns.length; i++) {
      const vc = virtualColumns[i];
      if (!getIsPinned(vc.index)) {
        firstNonPinned = i;
        break;
      }
    }

    if (typeof firstNonPinned !== "undefined") {
      for (let i = 0; i < virtualColumns.length; i++) {
        const vc = virtualColumns[i];
        if (getIsPinned(vc.index) && i < firstNonPinned) {
          pinnedTotalSize += vc.size;
        }
      }
      offsetTop = virtualColumns[firstNonPinned].start - pinnedTotalSize;
    }
  }

  // offsetBottom
  {
    // from right to left
    let pinnedTotalSize = 0;
    let firstNonPinned: undefined | number;

    for (let i = virtualColumns.length - 1; i >= 0; i--) {
      const vc = virtualColumns[i];
      if (!getIsPinned(vc.index)) {
        firstNonPinned = i;
        break;
      }
    }

    if (typeof firstNonPinned !== "undefined") {
      for (let i = virtualColumns.length - 1; i >= 0; i--) {
        const vc = virtualColumns[i];
        if (getIsPinned(vc.index) && i > firstNonPinned) {
          pinnedTotalSize = vc.size;
        }
      }
      offsetBottom =
        totalSize - virtualColumns[firstNonPinned].end - pinnedTotalSize;
    }
  }
  return { offsetTop: offsetTop, offsetBottom: offsetBottom };
}
