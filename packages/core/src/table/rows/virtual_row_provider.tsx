import {
  defaultRangeExtractor,
  measureElement,
  Range,
  useVirtualizer,
  Virtualizer,
} from "@tanstack/react-virtual";
import React from "react";
import { RowVirtualizerContext } from "../contexts/row_virtualizer_context";
import { useColVirtualizer } from "../hooks/use_col_virtualizer";
import { useTableProps } from "../hooks/use_table_props";
import { useTableRef } from "../hooks/use_table_ref";
import { useTriggerTablePropsUpdate } from "../hooks/use_trigger_table_props_update";
import { useTableContext } from "../table_context";
import { VirtualCell, VirtualRow } from "../types";
import { RowVirtualizerContextType } from "./row_virtualizer_context_type";
import { Cell } from "@tanstack/react-table";

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

  const { getMainHeaderGroup } = useColVirtualizer();

  const { allRows } = useTableProps((table) => {
    const allRows = table.getRowModel().rows;
    return { allRows };
  });

  const rowIds = React.useMemo(() => {
    return allRows.map((row) => row.id);
  }, [allRows]);

  const tableRef = useTableRef();

  const _refs = {
    rowIds,
    getMainHeaderGroup,
    getTable: () => tableRef.current,
  };
  const refs = React.useRef(_refs);
  refs.current = _refs;

  // we need to trigger a re-render the virtualizer when the table instance updates
  useTableProps(() => ({}), {
    dependencies: ["table"],
    arePropsEqual: () => true,
  });

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
    rangeExtractor: React.useCallback((range: Range): number[] => {
      const defaultRange = defaultRangeExtractor(range);
      const next = new Set(defaultRange);

      const table = refs.current.getTable();
      [...table.getTopRows(), ...table.getBottomRows()].forEach((row) => {
        next.add(refs.current.rowIds.indexOf(row.id));
      });

      const n = [...next].sort((a, b) => a - b);
      return n;
    }, []),
  });

  const getRowsInitialRef = {
    rowVirtualizer,
    allRows,
    rowIds,
  };
  const getRowsRef = React.useRef(getRowsInitialRef);
  getRowsRef.current = getRowsInitialRef;

  type RowCache = {
    cells?: Cell<any, unknown>[];
    virtualCells?: VirtualCell[];
  };
  const rowCache = React.useRef<
    Record<
      /**
       * row index
       */
      number,
      RowCache | undefined
    >
  >({});

  const writeToCacheRef = React.useRef(false);

  const getRows = React.useCallback(() => {
    const updateCache = (index: number, data: RowCache) => {
      if (!rowCache.current[index]) {
        rowCache.current[index] = {};
      }
      Object.assign(rowCache.current[index], data);
    };
    const getCache = <T extends keyof RowCache>(index: number, key: T) =>
      rowCache.current[index]?.[key];

    const rowVirtualizer = getRowsRef.current.rowVirtualizer;
    const virtualRows = rowVirtualizer
      .getVirtualItems()
      .map((item): VirtualRow => {
        const getRow = () => {
          const allRows = getRowsRef.current.allRows;
          return allRows[item.index];
        };
        const staticRow = getRow();
        const getAllCells = () => {
          const cacheEntry = getCache(item.index, "cells");
          if (cacheEntry) {
            return cacheEntry;
          }

          const cells = getRow().getVisibleCells();
          updateCache(item.index, { cells });
          return cells;
        };

        const getCells = () => {
          const cacheEntry = getCache(item.index, "virtualCells");
          if (cacheEntry) {
            return cacheEntry;
          }

          const mainHeaderGroup = refs.current.getMainHeaderGroup();
          const virtualCells = mainHeaderGroup
            .getHeaders()
            .map((header): VirtualCell => {
              const getCell = () => getAllCells()[header.headerIndex];
              const id = getCell().id;
              return {
                id,
                cell: getCell,
                vheader: header,
              };
            });
          updateCache(item.index, { virtualCells });
          return virtualCells;
        };

        if (writeToCacheRef.current) {
          updateCache(item.index, {
            cells: getAllCells(),
            virtualCells: getCells(),
          });
        }
        return {
          row: getRow,
          id: staticRow.id,
          // flatIndex: staticRow.index,
          flatIndex: getRowsRef.current.rowIds.indexOf(staticRow.id),
          isPinned: () => {
            const row = getRow();
            const pinned = row.getIsPinned();
            return pinned === "bottom"
              ? "end"
              : pinned === "top"
                ? "start"
                : false;
          },
          rowVirtualizer,
          getCells,
        };
      });
    const rows = virtualRows;
    return rows;
  }, []);

  useTableProps(() => ({}), {
    dependencies: ["table", "col_visible_range_main"],
    arePropsEqual: () => false,
  });
  writeToCacheRef.current = true;
  rowCache.current = {};
  const virtualRows = getRows();
  writeToCacheRef.current = false;
  const virtualRowsRef = React.useRef(virtualRows);
  virtualRowsRef.current = virtualRows;

  const initialRefs = {
    rowVirtualizer,
    getMainHeaderGroup,
    getTable: () => tableRef.current,
  };
  const memoRefs = React.useRef(initialRefs);
  memoRefs.current = initialRefs;

  const visibleRangeCacheKey = rowVirtualizer
    .getVirtualItems()
    .map((item) => item.index)
    .join(",");

  useTriggerTablePropsUpdate("row_visible_range", visibleRangeCacheKey);
  useTriggerTablePropsUpdate("row_offsets");

  const getVerticalOffsets = () => {
    const rowVirtualizer = memoRefs.current.rowVirtualizer;
    const allRows = memoRefs.current.getTable().getRowModel().rows;
    const { offsetTop, offsetBottom } = getRowVirtualizedOffsets({
      virtualColumns: rowVirtualizer.getVirtualItems(),
      getIsPinned(vcIndex) {
        const row = allRows[vcIndex];
        return !!row.getIsPinned();
      },
      totalSize: rowVirtualizer.getTotalSize(),
    });
    return {
      offsetTop,
      offsetBottom,
    };
  };

  const verticalOffsets = getVerticalOffsets();
  const verticalOffsetsRef = React.useRef(verticalOffsets);
  verticalOffsetsRef.current = verticalOffsets;

  const context = React.useMemo(
    (): RowVirtualizerContextType => ({
      getRows: () => virtualRowsRef.current,
      rowVirtualizer: memoRefs.current.rowVirtualizer,
      getVerticalOffsets: () => verticalOffsetsRef.current,
      getHorizontalOffsets: () => {
        const offsets = memoRefs.current.getMainHeaderGroup().getOffsets();
        return {
          offsetLeft: offsets.offsetLeft,
          offsetRight: offsets.offsetRight,
        };
      },
    }),
    [],
  );
  return (
    <RowVirtualizerContext.Provider value={context}>
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
