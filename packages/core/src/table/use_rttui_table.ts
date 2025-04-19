import { Header, HeaderGroup, Table } from "@tanstack/react-table";
import {
  defaultRangeExtractor,
  measureElement,
  observeElementOffset,
  observeElementRect,
  VirtualItem,
  Virtualizer,
  VirtualizerOptions,
} from "@tanstack/react-virtual";
import React from "react";
import { Skin } from "../skin";
import { getIsPinned, mapColumnPinningPositionToPinPos } from "../utils";
import { FilteredHeaderGroup } from "./cols/use_header_group_virtualizers";
import { HeaderIndex } from "./cols/virtual_header/types";
import {
  CombinedHeaderGroup,
  PinPos,
  RttuiCell,
  RttuiHeader,
  RttuiHeaderGroup,
  RttuiHeaderGroups,
  RttuiRow,
  RttuiTable,
  UiProps,
  VirtualHeaderCellState,
} from "./types";
import { useTableProps } from "./hooks/use_table_props";
import { useTablePropsContext } from "./hooks/use_table_props_context";
import { Dependency } from "./contexts/table_props_context";

type Diff = {
  type: "col_offsets_main";
};

type ColPos = "left" | "center" | "right";
type RowPos = "top" | "center" | "bottom";
type HeaderType = "header" | "footer";

type ColVirtualizer = {
  virtualizer: Virtualizer<any, any>;
  _slow_lookup: Header<any, unknown>[];
  groupIndex: number;
};

export const useRttuiTable = ({
  table,
  uiProps,
  tableContainerRef,
  skin,
}: {
  table: Table<any>;
  uiProps: UiProps;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  skin: Skin;
}): React.RefObject<RttuiTable> => {
  const rttuiRef = React.useRef<RttuiTable | undefined>(undefined);
  const updateRef = React.useRef(updateRttuiTable);

  const virtualizers = useVirtualizers({
    table,
    tableContainerRef,
    uiProps,
    skin,
    updateRttuiTable: () => {
      return updateRef.current();
    },
  });

  function updateRttuiTable(): Diff[] {
    const _slow_allRows = table.getRowModel().rows;
    const diffs: Diff[] = [];

    const virtRows = virtualizers.rowVirtualizer.getVirtualItems();
    const rows: Record<RowPos, RttuiRow[]> = {
      bottom: [],
      center: [],
      top: [],
    };

    const {
      allVirtHeaders: allMainVirtHeaders,
      allVirtItems: allMainVirtItems,
      virtHeaders: mainVirtHeaders,
    } = getRttuiHeaders(
      virtualizers.colVirtualizers.main,
      virtualizers.colVirtualizers.main.groupIndex,
    );

    const allVirtRows: RttuiRow[] = [];
    const rowLookup: Record<number, RttuiRow> = {};
    const cellLookup: Record<number, Record<number, RttuiCell>> = {};
    virtRows.forEach((vrow) => {
      const row = _slow_allRows[vrow.index];
      const pinned = row.getIsPinned();

      const cells: Record<ColPos, RttuiCell[]> = {
        left: [],
        right: [],
        center: [],
      };

      const _slow_allVisibleCells = row.getVisibleCells();

      allMainVirtHeaders.forEach((header) => {
        const cell = _slow_allVisibleCells[header.headerIndex];
        const rttuiCell: RttuiCell = {
          columnIndex: header.headerIndex,
          rowIndex: vrow.index,
          cell,
          header,
          state: header.state,
        };

        const pinned = header.state.isPinned;
        if (pinned === "start") {
          cells.left.push(rttuiCell);
        } else if (pinned === "end") {
          cells.right.push(rttuiCell);
        } else {
          cells.center.push(rttuiCell);
        }
        if (!cellLookup[vrow.index]) {
          cellLookup[vrow.index] = {};
        }
        cellLookup[vrow.index][header.headerIndex] = rttuiCell;
      });

      const rttuiRow: RttuiRow = {
        row,
        left: cells.left,
        right: cells.right,
        center: cells.center,
        relativeIndex: NaN,
        rowIndex: vrow.index,
      };

      let relativeIndex = vrow.index;

      if (pinned === "top") {
        rows.top.push(rttuiRow);
        relativeIndex = rows.top.length - 1;
      } else if (pinned === "bottom") {
        rows.bottom.push(rttuiRow);
        relativeIndex = rows.bottom.length - 1;
      } else {
        rows.center.push(rttuiRow);
        relativeIndex = vrow.index;
      }
      rowLookup[vrow.index] = rttuiRow;

      rttuiRow.relativeIndex = relativeIndex;
      allVirtRows.push(rttuiRow);
    });

    const getRttuiHeaderGroups = (type: HeaderType) => {
      const headerGroups: RttuiHeaderGroups = {
        groups: [],
        groupLookup: {},
        headerLookup: {},
      };
      virtualizers.colVirtualizers[type].forEach((cv, groupIndex) => {
        const { virtHeaders, headerLookup, allVirtHeaders, allVirtItems } =
          getRttuiHeaders(cv, groupIndex);
        const headerGroup: RttuiHeaderGroup = {
          ...virtHeaders,
          groupIndex: groupIndex,
          virtualizer: cv.virtualizer,
          ...getColOffsets({
            headers: allVirtItems,
            totalSize: cv.virtualizer.getTotalSize(),
            getProps: (relativeIndex) => ({
              start: allVirtItems[relativeIndex].start,
              end: allVirtItems[relativeIndex].end,
              isPinned: allVirtHeaders[relativeIndex].state.isPinned,
            }),
          }),
        };
        headerGroups.groupLookup[groupIndex] = headerGroup;
        headerGroups.headerLookup[groupIndex] = headerLookup;
        headerGroups.groups.push(headerGroup);
      });

      return headerGroups;
    };

    const rttuiTable: RttuiTable = {
      tanstackTable: table,
      uiProps,
      virtualData: {
        body: {
          virtualizer: virtualizers.rowVirtualizer,
          ...getRowOffsets({
            rows: allVirtRows,
            totalSize: virtualizers.rowVirtualizer.getTotalSize(),
            getProps: (row, relativeIndex) => ({
              isPinned: Boolean(row.row.getIsPinned()),
              height: virtRows[relativeIndex].size,
              start: virtRows[relativeIndex].start,
              end: virtRows[relativeIndex].end,
            }),
          }),
          ...getColOffsets({
            headers: allMainVirtItems,
            totalSize:
              virtualizers.colVirtualizers.main.virtualizer.getTotalSize(),
            getProps: (relativeIndex) => ({
              start: allMainVirtItems[relativeIndex].start,
              end: allMainVirtItems[relativeIndex].end,
              isPinned: allMainVirtHeaders[relativeIndex].state.isPinned,
            }),
          }),
          hasRows: virtRows.length > 0,
          rows,
          rowLookup,
          cellLookup,
        },
        header: getRttuiHeaderGroups("header"),
        footer: getRttuiHeaderGroups("footer"),
      },
    };
    rttuiRef.current = rttuiTable;
    return [];
  }
  updateRttuiTable();
  updateRef.current = updateRttuiTable;

  return rttuiRef as React.RefObject<RttuiTable>;
};

function getHeaderState({
  header,
  headerIndex,
  _slow_headers,
  virtualItem,
}: {
  header: Header<any, unknown>;
  headerIndex: number;
  _slow_headers: Header<any, unknown>[];
  virtualItem: VirtualItem;
}): VirtualHeaderCellState {
  const isPinned = getIsPinned(header);

  const isIndexPinned = (index: number) =>
    _slow_headers[index] ? getIsPinned(_slow_headers[index]) : false;

  let isLastPinned = false;
  let isFirstPinned = false;
  if (isPinned === "left") {
    isLastPinned = !isIndexPinned(headerIndex + 1);
    isFirstPinned = headerIndex === 0;
  } else if (isPinned === "right") {
    isLastPinned = !isIndexPinned(headerIndex - 1);
    isFirstPinned = headerIndex === _slow_headers.length - 1;
  }
  let isLast = false;
  let isFirst = false;

  if (headerIndex === 0) {
    isFirst = true;
  }
  if (headerIndex === _slow_headers.length - 1) {
    isLast = true;
  }
  let isFirstCenter = false;
  let isLastCenter = false;
  if (isPinned === false) {
    isLastCenter =
      !_slow_headers[headerIndex + 1] ||
      isIndexPinned(headerIndex + 1) === "right";
    isFirstCenter =
      !_slow_headers[headerIndex - 1] ||
      isIndexPinned(headerIndex - 1) === "left";
  }

  const width = virtualItem.size;

  const state: VirtualHeaderCellState = {
    isPinned: mapColumnPinningPositionToPinPos(isPinned),
    width,
    isLastPinned,
    isFirstPinned,
    isLast,
    isFirst,
    isFirstCenter,
    isLastCenter,
  };
  return state;
}

function getRttuiHeaders(virtualizer: ColVirtualizer, groupIndex: number) {
  const virtHeaders: Record<ColPos, RttuiHeader[]> = {
    left: [],
    center: [],
    right: [],
  };
  const headerLookup: Record<number, RttuiHeader> = {};
  const allVirtItems = virtualizer.virtualizer.getVirtualItems();
  const allVirtHeaders = allVirtItems.map((item): RttuiHeader => {
    const header = virtualizer._slow_lookup[item.index];
    const pinned = getIsPinned(header);
    const rttuiHeader: RttuiHeader = {
      header,
      groupIndex,
      headerIndex: item.index,
      state: getHeaderState({
        header,
        headerIndex: item.index,
        _slow_headers: virtualizer._slow_lookup,
        virtualItem: item,
      }),
    };
    if (pinned === "left") {
      virtHeaders.left.push(rttuiHeader);
    } else if (pinned === "right") {
      virtHeaders.right.push(rttuiHeader);
    } else {
      virtHeaders.center.push(rttuiHeader);
    }
    headerLookup[item.index] = rttuiHeader;
    return rttuiHeader;
  });
  return {
    virtHeaders,
    allVirtHeaders,
    headerLookup,
    allVirtItems,
  };
}

/**
 * when we are only rendering a window of columns while maintaining a scrollbar we need to move the elements as we remove elements to the left
 * we are assuming that the columns are rendered in order, so pinned left, followed by non-pinned, followed by pinned right
 */
export function getColOffsets({
  headers,
  totalSize,
  getProps,
}: {
  headers: VirtualItem[];
  totalSize: number;
  getProps: (relativeIndex: number) => {
    start: number;
    end: number;
    isPinned: PinPos;
  };
}) {
  let offsetLeft = 0;
  let offsetRight = 0;

  {
    let lastPinned: undefined | number;
    let firstNonPinned: undefined | number;
    for (let i = 0; i < headers.length; i++) {
      if (getProps(i).isPinned === "start") {
        lastPinned = i;
      } else {
        firstNonPinned = i;
        break;
      }
    }

    if (typeof firstNonPinned !== "undefined") {
      offsetLeft = getProps(firstNonPinned).start;
      if (typeof lastPinned !== "undefined") {
        offsetLeft -= getProps(lastPinned).end;
      }
    }
  }
  {
    // from right to left
    let lastPinned: undefined | number;
    let firstNonPinned: undefined | number;
    for (let i = headers.length - 1; i >= 0; i--) {
      const vc = headers[i];
      if (!vc) {
        console.log(vc, headers, i);
      }
      if (getProps(i).isPinned === "end") {
        lastPinned = i;
      } else {
        firstNonPinned = i;
        break;
      }
    }

    // a,b, , , , , ,c,d // pinned
    // a,b,c,d,e,f,g,h,i // window
    // offsetRight should be 0 because c.start - g.start = 0
    // g = firstNonPinned
    // c = lastPinned
    // lastPinned.start - firstNonPinned.end

    // in this scenario we have no pinned, first nonPinned will be i, and size - firstNonPinned.end = 0
    // a,b,c,d,e,f,g,h,i

    // in this scneario we have scrolled a bit
    //      |               |
    // a,b,c,d,e,f,g,h,i,j,k,l,m
    // firstNonPinned = is k, we must have an offsetRight of size - k.end

    // in this scneario we have scrolled a bit, and we have pinned
    //      |            a,b|     // pinned
    // a,b,c,d,e,f,g,h,i,j,k,l,m  // non-pinned
    // firstNonPinned = i
    // lastPinned = a
    // a.start - i.end

    if (typeof firstNonPinned !== "undefined") {
      offsetRight = totalSize - getProps(firstNonPinned).end;
      if (typeof lastPinned !== "undefined") {
        offsetRight = getProps(lastPinned).start - getProps(firstNonPinned).end;
      }
    }
  }

  return { offsetLeft, offsetRight };
}

/**
 * when we are only rendering a window of columns while maintaining a scrollbar we need to move the elements as we remove elements to the left
 * we are assuming that the columns are rendered in order, so pinned left, followed by non-pinned, followed by pinned right
 */
function getRowOffsets({
  rows,
  totalSize,
  getProps,
}: {
  rows: RttuiRow[];
  getProps: (
    row: RttuiRow,
    relativeIndex: number,
  ) => {
    isPinned: boolean;
    height: number;
    start: number;
    end: number;
  };
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

    for (let i = 0; i < rows.length; i++) {
      const vc = rows[i];
      if (!getProps(vc, i).isPinned) {
        firstNonPinned = i;
        break;
      }
    }

    if (typeof firstNonPinned !== "undefined") {
      for (let i = 0; i < rows.length; i++) {
        const vc = rows[i];
        if (getProps(vc, i).isPinned && i < firstNonPinned) {
          pinnedTotalSize += getProps(vc, i).height;
        }
      }
      offsetTop =
        getProps(rows[firstNonPinned], firstNonPinned).start - pinnedTotalSize;
    }
  }

  // offsetBottom
  {
    // from right to left
    let pinnedTotalSize = 0;
    let firstNonPinned: undefined | number;

    for (let i = rows.length - 1; i >= 0; i--) {
      const vc = rows[i];
      if (!getProps(vc, i).isPinned) {
        firstNonPinned = i;
        break;
      }
    }

    if (typeof firstNonPinned !== "undefined") {
      for (let i = rows.length - 1; i >= 0; i--) {
        const vc = rows[i];
        if (getProps(vc, i).isPinned && i > firstNonPinned) {
          pinnedTotalSize = getProps(vc, i).height;
        }
      }
      offsetBottom =
        totalSize -
        getProps(rows[firstNonPinned], firstNonPinned).end -
        pinnedTotalSize;
    }
  }
  return { offsetTop, offsetBottom };
}

function useVirtualizers({
  table,
  tableContainerRef,
  uiProps,
  skin,
  updateRttuiTable,
}: {
  table: Table<any>;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  uiProps: UiProps;
  skin: Skin;
  updateRttuiTable: () => Diff[];
}) {
  const context = useTablePropsContext();
  const virtualizersRef = React.useRef<{
    rowVirtualizer: Virtualizer<any, any>;
    colVirtualizers: {
      header: ColVirtualizer[];
      footer: ColVirtualizer[];
      main: ColVirtualizer;
    };
  }>(null);

  const _slow_allRows = table.getRowModel().rows;

  if (!virtualizersRef.current) {
    const _slow_leafHeaders = table.getLeafHeaders();
    virtualizersRef.current = {
      rowVirtualizer: new Virtualizer({
        count: _slow_allRows.length,
        getScrollElement: () => tableContainerRef.current,
        overscan: uiProps.rowOverscan,
        scrollToFn: () => {},
        observeElementRect,
        observeElementOffset,
        estimateSize: () => skin.rowHeight,
        getItemKey: (index: number) => _slow_allRows[index].id,
        onChange: (_, sync) => {
          updateRttuiTable();
          context.triggerUpdate(
            [{ type: "row_visible_range" }, { type: "row_offsets" }],
            {
              type: "from_dom_event",
              sync,
            },
          );
        },
        measureElement: (
          element: any,
          entry: ResizeObserverEntry | undefined,
          instance: Virtualizer<HTMLDivElement, any>,
        ) => {
          const defaultSize = measureElement(element, entry, instance);
          return Math.max(defaultSize, skin.rowHeight);
        },
        rangeExtractor: (range): number[] => {
          const defaultRange = defaultRangeExtractor(range);
          const next = new Set(defaultRange);

          _slow_allRows.forEach((row, index) => {
            if (row.getIsPinned()) {
              next.add(index);
            }
          });

          const n = [...next].sort((a, b) => a - b);
          return n;
        },
      }),
      colVirtualizers: {
        header: [],
        footer: [],
        main: {
          groupIndex: 0,
          virtualizer: createColVirtualizer({
            _slow_allHeaders: _slow_leafHeaders,
            tableContainerRef,
            columnOverscan: uiProps.columnOverscan,
            onChange: (sync) => {
              // should be mirrored in functionality to the onChange further down
              updateRttuiTable();
              context.triggerUpdate(
                [
                  {
                    type: "col_visible_range_main",
                  },
                  {
                    type: "col_offsets_main",
                  },
                ],
                { type: "from_dom_event", sync },
              );
            },
          }),
          _slow_lookup: _slow_leafHeaders,
        },
      },
    };
  }
  const virtualizers = virtualizersRef.current;

  let hasFoundMainGroup = false;

  const headerGroups: FilteredHeaderGroup[] = [];

  for (const { type, groups } of [
    {
      type: "header" as const,
      groups: [
        table.getLeftHeaderGroups(),
        table.getCenterHeaderGroups(),
        table.getRightHeaderGroups(),
      ],
    },
    {
      type: "footer" as const,
      groups: [
        table.getLeftFooterGroups(),
        table.getCenterFooterGroups(),
        table.getRightFooterGroups(),
      ],
    },
  ]) {
    const h = combineHeaderGroups(groups, type);
    headerGroups.push(h);
    h.filteredHeaderGroups.forEach((group, groupIndex, orig) => {

      let isMainGroup = false;
      if (!hasFoundMainGroup) {
        if (type === "header") {
          if (groupIndex === orig.length - 1) {
            hasFoundMainGroup = true;
            isMainGroup = true;
          }
        } else if (type === "footer") {
          if (groupIndex === 0) {
            hasFoundMainGroup = true;
            isMainGroup = true;
          }
        }
      }

      const onChange = (sync: boolean) => {
        updateRttuiTable();
        const dependencies: Dependency[] = [
          { type: "col_visible_range", groupIndex, groupType: type },
          { type: "col_offsets", groupIndex, groupType: type },
        ];
        if (isMainGroup) {
          dependencies.push(
            { type: "col_visible_range_main" },
            { type: "col_offsets_main" },
          );
        }
        context.triggerUpdate(dependencies, {
          type: "from_dom_event",
          sync,
        });
      };

      if (virtualizers.colVirtualizers[type][groupIndex]) {
        // update the virtualizer options
        const currentVirtualizer =
          virtualizers.colVirtualizers[type][groupIndex];
        currentVirtualizer.virtualizer.setOptions({
          ...currentVirtualizer.virtualizer.options,
          ...getNewColVirtualizerOptions(group._slow_headers),
          onChange(_, sync) {
            onChange(sync);
          },
        });
        // update the lookup
        currentVirtualizer._slow_lookup = group._slow_headers;
        return;
      }

      virtualizers.colVirtualizers[type][groupIndex] = {
        groupIndex,
        virtualizer: createColVirtualizer({
          _slow_allHeaders: group._slow_headers,
          tableContainerRef,
          columnOverscan: uiProps.columnOverscan,
          onChange,
        }),
        _slow_lookup: group._slow_headers,
      };
    });
  }

  const getIndex = (colId: string) => {
    const headerGroup = headerGroups.find((hg) => hg.headerIndices[colId]);
    if (!headerGroup) {
      return undefined;
    }
    return headerGroup.headerIndices[colId];
  };

  virtualizers.colVirtualizers.main =
    virtualizers.colVirtualizers.header[
      virtualizers.colVirtualizers.header.length - 1
    ] ??
    virtualizers.colVirtualizers.footer[0] ??
    virtualizers.colVirtualizers.main;

  const allVirtualizers = new Set(
    Object.values(virtualizers.colVirtualizers)
      .flat()
      .map((cv) => cv.virtualizer),
  );

  allVirtualizers.add(virtualizers.rowVirtualizer);

  allVirtualizers.forEach((cv) => {
    cv.shouldAdjustScrollPositionOnItemSizeChange = undefined;
    cv.calculateRange();
  });

  const allVirtualizersRef = React.useRef(allVirtualizers);
  allVirtualizersRef.current = allVirtualizers;

  const { columnSizingInfo, columnSizing } = table.getState();

  const getIndexRef = React.useRef(getIndex);
  getIndexRef.current = getIndex;

  React.useLayoutEffect(() => {
    if (columnSizingInfo.isResizingColumn) {
      const indices = getIndexRef.current(columnSizingInfo.isResizingColumn);
      if (!indices) {
        return;
      }
      indices.forEach(({ headerIndex, header, groupIndex, type }) => {
        if (!virtualizersRef.current) {
          return;
        }
        const virtualizer =
          virtualizersRef.current.colVirtualizers[type][groupIndex].virtualizer;
        const headerSize = header.getSize();

        virtualizer.resizeItem(headerIndex, headerSize);
      });
    }
  }, [columnSizingInfo.isResizingColumn, columnSizing]);

  React.useLayoutEffect(() => {
    return () => {
      const cleanups = Array.from(allVirtualizersRef.current).map((cv) => {
        return cv._didMount();
      });
      cleanups.forEach((cleanup) => {
        cleanup();
      });
    };
  }, []);

  React.useLayoutEffect(() => {
    Array.from(allVirtualizersRef.current).forEach((cv) => {
      cv._willUpdate();
    });
  });

  return virtualizers;
}

function getNewColVirtualizerOptions(
  _slow_allHeaders: Header<any, unknown>[],
): Pick<
  VirtualizerOptions<any, any>,
  "count" | "estimateSize" | "rangeExtractor" | "getItemKey"
> {
  return {
    count: _slow_allHeaders.length,
    estimateSize: (index) => _slow_allHeaders[index].getSize(),
    rangeExtractor: (range) => {
      const defaultRange = defaultRangeExtractor(range);
      const next = new Set(defaultRange);

      for (let i = 0; i < _slow_allHeaders.length; i++) {
        const header = _slow_allHeaders[i];
        if (getIsPinned(header)) {
          next.add(i);
        }
      }

      const sortedRange = [...next].sort((a, b) => {
        return a - b;
      });
      return sortedRange;
    },
    getItemKey: (index) => _slow_allHeaders[index].id,
  };
}
function createColVirtualizer({
  _slow_allHeaders,
  tableContainerRef,
  columnOverscan,
  onChange,
}: {
  _slow_allHeaders: Header<any, unknown>[];
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  columnOverscan: number;
  onChange: (sync: boolean) => void;
}) {
  return new Virtualizer({
    getScrollElement: () => tableContainerRef.current,
    horizontal: true,
    overscan: columnOverscan,
    observeElementRect,
    observeElementOffset,
    scrollToFn: () => {},
    onChange: (_, sync) => {
      onChange(sync);
    },
    ...getNewColVirtualizerOptions(_slow_allHeaders),
  });
}

function combineHeaderGroups(
  groups: HeaderGroup<any>[][],
  type: "header" | "footer",
): FilteredHeaderGroup {
  const numGroups = Math.max(...groups.map((group) => group.length));
  const combinedGroups: CombinedHeaderGroup[] = [];
  for (let i = 0; i < numGroups; i++) {
    combinedGroups[i] = {
      id: groups.map((group) => group[i].id).join(""),
      _slow_headers: groups.flatMap((group) => {
        return group[i].headers;
      }),
    };
  }

  const headerIndices: Record<string, undefined | HeaderIndex[]> = {};
  const filteredHeaderGroups: CombinedHeaderGroup[] = [];
  const headerGroupIndices: Record<
    string,
    { groupIndex: number; headerIndices: Record<string, number> }
  > = {};

  combinedGroups.forEach((group) => {
    let hasVisibleHeader = false;
    const groupHeaderIndices: Record<string, HeaderIndex[]> = {};
    group._slow_headers.forEach((header, j) => {
      if (!groupHeaderIndices[header.column.id]) {
        groupHeaderIndices[header.column.id] = [];
      }
      groupHeaderIndices[header.column.id].push({
        headerIndex: j,
        groupIndex: filteredHeaderGroups.length,
        columnId: header.column.id,
        headerId: header.id,
        header,
        groupId: group.id,
        type,
      });
      if (header.column.columnDef[type]) {
        hasVisibleHeader = true;
      }
    });
    if (hasVisibleHeader) {
      filteredHeaderGroups.push(group);
      Object.assign(headerIndices, groupHeaderIndices);
    }
  });
  filteredHeaderGroups.forEach((group, i) => {
    const headerIndices: Record<string, number> = {};
    group._slow_headers.forEach((header, j) => {
      headerIndices[header.id] = j;
    });
    headerGroupIndices[group.id] = {
      groupIndex: i,
      headerIndices,
    };
  });
  return {
    filteredHeaderGroups,
    headerIndices,
    headerGroupIndices,
  };
}
