import {
  defaultRangeExtractor,
  measureElement,
  Range,
  useVirtualizer,
  Virtualizer,
} from "@tanstack/react-virtual";
import React, { CSSProperties } from "react";
import { useColContext } from "../cols/col_context";
import { useTableContext } from "../table_context";
import { VirtualCell, VirtualRow } from "./table_row";
import { VirtualRowCache } from "./virtual_row_cache";
import { VirtualRowContext } from "./virtual_row_context";

const dndStyle: CSSProperties = {};

export const VirtualRowProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { table, tableContainerRef, skin, config } = useTableContext();

  /* to be implemented
  const [draggedRowId, setDraggedRowId] = React.useState<string | null>(null);

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
  }
  */

  const { mainHeaderGroup } = useColContext();

  const allRows = table.getRowModel().rows;
  const rowIds = React.useMemo(() => {
    return allRows.map((row) => row.id);
  }, [allRows]);

  const _refs = { table, rowIds };
  const refs = React.useRef(_refs);
  refs.current = _refs;

  const rowVirtualizer = useVirtualizer({
    count: allRows.length,
    estimateSize: React.useCallback(() => skin.rowHeight, [skin.rowHeight]),
    getItemKey: React.useCallback(
      (index: number) => refs.current.rowIds[index],
      [],
    ),
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
    overscan: config.rowOverscan,
    rangeExtractor: React.useCallback((range: Range): number[] => {
      const defaultRange = defaultRangeExtractor(range);
      const next = new Set(defaultRange);

      [
        ...refs.current.table.getTopRows(),
        ...refs.current.table.getBottomRows(),
      ].forEach((row) => {
        next.add(refs.current.rowIds.indexOf(row.id));
      });

      const n = [...next].sort((a, b) => a - b);
      return n;
    }, []),
  });

  const { offsetTop, offsetBottom } = getRowVirtualizedOffsets({
    virtualColumns: rowVirtualizer.getVirtualItems(),
    getIsPinned(vcIndex) {
      const row = allRows[vcIndex];
      return !!row.getIsPinned();
    },
    totalSize: rowVirtualizer.getTotalSize(),
  });

  const virtualRows = rowVirtualizer
    .getVirtualItems()
    .map((item): VirtualRow => {
      const row = allRows[item.index];
      const pinned = row.getIsPinned();

      const allCells = row.getVisibleCells();

      return {
        row,
        flatIndex: rowIds.indexOf(row.id),
        isDragging: false,
        isPinned:
          pinned === "bottom" ? "end" : pinned === "top" ? "start" : false,
        dndStyle,
        rowVirtualizer,

        cells: mainHeaderGroup.headers.map((header): VirtualCell => {
          return {
            id: header.headerId,
            columnId: header.columnId,
            cell: allCells[header.headerIndex],
            isPinned: header.isPinned,
            isLastPinned: header.isLastPinned,
            isFirstPinned: header.isFirstPinned,
            isLast: header.isLast,
            isFirst: header.isFirst,
            isFirstCenter: header.isFirstCenter,
            isLastCenter: header.isLastCenter,
            width: header.width,
            start: header.start,
            end: header.end,
            dndStyle: {},
          };
        }),
      };
    });

  // wip if we make the virtualRows contain start and size info
  const [rowCache] = React.useState(() => {
    const rowCache = new VirtualRowCache();
    return rowCache;
  });

  const cachedVirtualRows = rowCache.update(virtualRows);
  const rows = cachedVirtualRows;

  const offsetLeft = mainHeaderGroup.offsetLeft;
  const offsetRight = mainHeaderGroup.offsetRight;

  return (
    <VirtualRowContext.Provider
      value={React.useMemo((): VirtualRowContext => {
        return {
          moveResult: null,
          rows: rows,
          setIsDragging(_dragState) {
            // to be implemented
          },
          rowVirtualizer,
          offsetTop,
          offsetBottom,
          offsetLeft,
          offsetRight,
        };
      }, [rows, offsetBottom, offsetLeft, offsetRight, offsetTop, rowVirtualizer])}
    >
      {children}
    </VirtualRowContext.Provider>
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
