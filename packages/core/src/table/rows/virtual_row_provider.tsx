import {
  defaultRangeExtractor,
  measureElement,
  Range,
  useVirtualizer,
  Virtualizer,
} from "@tanstack/react-virtual";
import React, { CSSProperties } from "react";
import { useTableRef } from "../hooks/useTableRef";
import { useColVirtualizer } from "../hooks/use_col_virtualizer";
import { useTableContext } from "../table_context";
import { VirtualCell, VirtualRow } from "../types";
import { VirtualRowCache } from "./virtual_row_cache";
import { RowVirtualizerContext } from "../contexts/RowVirtualizerContext";
import { RowVirtualizerContextType } from "./row_virtualizer_context_type";
import { useTableProps } from "../hooks/useTableProps";
const dndStyle: CSSProperties = {};

export const VirtualRowProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { tableContainerRef, skin, config } = useTableContext();

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

  const { mainHeaderGroup } = useColVirtualizer();

  const { allRows } = useTableProps((table) => {
    const allRows = table.getRowModel().rows;
    return { allRows };
  });

  const rowIds = React.useMemo(() => {
    return allRows.map((row) => row.id);
  }, [allRows]);

  const tableRef = useTableRef();

  const _refs = { rowIds };
  const refs = React.useRef(_refs);
  refs.current = _refs;

  const rowVirtualizer = useVirtualizer({
    count: allRows.length,
    estimateSize: React.useCallback(() => skin.rowHeight, [skin.rowHeight]),
    getItemKey: React.useCallback(
      (index: number) => refs.current.rowIds[index],
      [],
    ),
    getScrollElement: React.useCallback(
      () => tableContainerRef.current,
      [tableContainerRef],
    ),
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
    rangeExtractor: React.useCallback(
      (range: Range): number[] => {
        const defaultRange = defaultRangeExtractor(range);
        const next = new Set(defaultRange);

        [
          ...tableRef.current.getTopRows(),
          ...tableRef.current.getBottomRows(),
        ].forEach((row) => {
          next.add(refs.current.rowIds.indexOf(row.id));
        });

        const n = [...next].sort((a, b) => a - b);
        return n;
      },
      [tableRef],
    ),
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
      const getRow = () => allRows[item.index];
      const staticRow = getRow();
      const pinned = staticRow.getIsPinned();
      const getAllCells = () => getRow().getVisibleCells();

      return {
        row: getRow,
        id: staticRow.id,
        flatIndex: rowIds.indexOf(staticRow.id),
        isDragging: false,
        isPinned:
          pinned === "bottom" ? "end" : pinned === "top" ? "start" : false,
        dndStyle,
        rowVirtualizer,

        cells: mainHeaderGroup.headers.map((header): VirtualCell => {
          const getCell = () => getAllCells()[header.headerIndex];
          const id = getCell().id;
          return {
            id,
            cell: getCell,
            dndStyle: {},
            vheader: header,
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
    <RowVirtualizerContext.Provider
      value={React.useMemo((): RowVirtualizerContextType => {
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
      }, [
        rows,
        offsetBottom,
        offsetLeft,
        offsetRight,
        offsetTop,
        rowVirtualizer,
      ])}
    >
      {children}
    </RowVirtualizerContext.Provider>
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
