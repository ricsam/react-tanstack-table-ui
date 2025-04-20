import { Header, HeaderGroup, Table } from "@tanstack/react-table";
import {
  defaultRangeExtractor,
  measureElement,
  observeElementOffset as libObserveElementOffset,
  observeElementRect,
  VirtualItem,
  Virtualizer,
  VirtualizerOptions,
} from "@tanstack/react-virtual";
import React from "react";
import { Skin } from "../skin";
import { getIsPinned, mapColumnPinningPositionToPinPos } from "../utils";
import { HeaderIndex } from "./cols/virtual_header/types";
import { Dependency } from "./contexts/table_props_context";
import { useTablePropsContext } from "./hooks/use_table_props_context";
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
import { useMeasureContext } from "./hooks/use_measure_context";
type ObserveElementOffset = typeof libObserveElementOffset;
type ObserveOffsetCallBack = Parameters<ObserveElementOffset>[1];
// const useIsomorphicLayoutEffect =
//   typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;

type FilteredHeaderGroup = {
  filteredHeaderGroups: CombinedHeaderGroup[];
  headerIndices: Record<string, undefined | HeaderIndex[]>;
  headerGroupIndices: Record<
    string,
    { groupIndex: number; headerIndices: Record<string, number> }
  >;
};

const supportsScrollend =
  typeof window == "undefined" ? true : "onscrollend" in window;

const debounce = (
  targetWindow: Window & typeof globalThis,
  fn: (...args: any[]) => void,
  ms: number,
) => {
  let timeoutId: number;
  return function (this: any, ...args: Array<any>) {
    targetWindow.clearTimeout(timeoutId);
    timeoutId = targetWindow.setTimeout(() => fn.apply(this, args), ms);
  };
};

type ColPos = "left" | "center" | "right";
type RowPos = "top" | "center" | "bottom";
type HeaderType = "header" | "footer";

type ColVirtualizer = {
  virtualizer: Virtualizer<any, any>;
  _slow_lookup: Header<any, unknown>[];
  groupIndex: number;
};

function _slow_updateRttuiTable({
  virtualizers,
  table,
  uiProps,
}: {
  virtualizers: ReturnType<typeof useVirtualizers>;
  table: Table<any>;
  uiProps: UiProps;
}): RttuiTable {
  const _slow_allRows = table.getRowModel().rows;

  const virtRows = virtualizers.rowVirtualizer.getVirtualItems();
  const rows: Record<RowPos, RttuiRow[]> = {
    bottom: [],
    center: [],
    top: [],
  };

  const { allVirtHeaders: allMainVirtHeaders, allVirtItems: allMainVirtItems } =
    getRttuiHeaders(
      virtualizers.colVirtualizers.main,
      virtualizers.colVirtualizers.main.groupIndex,
    );

  const allVirtRows: RttuiRow[] = [];
  const rowLookup: Record<number, RttuiRow> = {};
  const cellLookup: Record<number, Record<number, RttuiCell>> = {};
  const bodyCols: Record<ColPos, RttuiHeader[]> = {
    left: [],
    right: [],
    center: [],
  };

  allMainVirtHeaders.forEach((header) => {
    const pinned = header.state.isPinned;
    if (pinned === "start") {
      bodyCols.left.push(header);
    } else if (pinned === "end") {
      bodyCols.right.push(header);
    } else {
      bodyCols.center.push(header);
    }
  });

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
        rowVirtualizer: virtualizers.rowVirtualizer,
        colVirtualizer: virtualizers.colVirtualizers.main.virtualizer,
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
        cols: bodyCols,
        hasRows: virtRows.length > 0,
        rows,
        rowLookup,
        cellLookup,
      },
      header: getRttuiHeaderGroups("header"),
      footer: getRttuiHeaderGroups("footer"),
    },
  };
  return rttuiTable;
}

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
}) => {
  const context = useTablePropsContext();
  const isInitial = React.useRef(true);
  React.useLayoutEffect(() => {
    context.triggerUpdate([{ type: "tanstack_table" }, { type: "ui_props" }], {
      type: "from_layout_effect",
      initial: isInitial.current,
    });
  });

  const virtualizers = useVirtualizers({
    table,
    tableContainerRef,
    uiProps,
    skin,
    updateRttuiTable,
  });

  function getNewInstance() {
    return _slow_updateRttuiTable({
      virtualizers,
      table,
      uiProps,
    });
  }

  const newInstance = getNewInstance();

  const rttuiRef = React.useRef<RttuiTable>(newInstance);
  rttuiRef.current = newInstance;

  const prev = React.useRef<RttuiTable>(newInstance);

  function updateRttuiTable(_sync: boolean) {
    const newInstance = getNewInstance();
    rttuiRef.current = newInstance;
    const oldInstance = prev.current;
    const diff = diffRttuiTable(oldInstance, newInstance);
    prev.current = newInstance;
    if (diff.length > 0) {
      context.triggerUpdate(diff, {
        type: "from_dom_event",
        sync: false,
        initial: isInitial.current,
      });
      isInitial.current = false;
    }
  }

  context.setInitialTableGetters({
    type: "initial",
    tableRef: rttuiRef,
  });

  return rttuiRef;
};

function diffRttuiTable(prev: RttuiTable | undefined, next: RttuiTable) {
  let diff: Dependency[] = [];
  if (!prev) {
    diff = [{ type: "*" }];
    return diff;
  }

  if (
    prev.virtualData.body.offsetTop !== next.virtualData.body.offsetTop ||
    prev.virtualData.body.offsetBottom !== next.virtualData.body.offsetBottom
  ) {
    diff.push({ type: "row_offsets" });
  }
  if (
    prev.virtualData.body.offsetLeft !== next.virtualData.body.offsetLeft ||
    prev.virtualData.body.offsetRight !== next.virtualData.body.offsetRight
  ) {
    diff.push({ type: "col_offsets_main" });
  }

  const serializeRows = (rows: RttuiRow[]) => {
    return rows.map((row) => row.rowIndex).join(",");
  };

  for (const pos of ["top", "center", "bottom"] as const) {
    if (
      serializeRows(prev.virtualData.body.rows[pos]) !==
      serializeRows(next.virtualData.body.rows[pos])
    ) {
      diff.push({ type: "row_visible_range" });
      break;
    }
  }

  const serializeCols = (cols: RttuiHeader[]) => {
    return cols.map((col) => col.headerIndex).join(",");
  };

  for (const pos of ["left", "center", "right"] as const) {
    if (
      serializeCols(prev.virtualData.body.cols[pos]) !==
      serializeCols(next.virtualData.body.cols[pos])
    ) {
      diff.push({ type: "col_visible_range_main" });
    }
  }

  const headerGroups = ["header", "footer"] as const;
  headerGroups.forEach((type) => {
    next.virtualData[type].groups.forEach((group, groupIndex) => {
      const prevGroup = prev?.virtualData[type].groups[groupIndex];
      if (!prevGroup) {
        diff.push({ type: "col_offsets", groupIndex, groupType: type });
        diff.push({ type: "col_visible_range", groupIndex, groupType: type });
        return;
      }
      if (
        group.offsetLeft !== prevGroup?.offsetLeft ||
        group.offsetRight !== prevGroup?.offsetRight
      ) {
        diff.push({ type: "col_offsets", groupIndex, groupType: type });
      }

      for (const pos of ["left", "center", "right"] as const) {
        if (serializeCols(prevGroup[pos]) !== serializeCols(group[pos])) {
          diff.push({
            type: "col_visible_range",
            groupIndex,
            groupType: type,
          });
          break;
        }
      }
    });
  });

  return diff;
}

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

const addEventListenerOptions = {
  passive: true,
};

/**
 * when we are only rendering a window of columns while maintaining a scrollbar we need to move the elements as we remove elements to the left
 * we are assuming that the columns are rendered in order, so pinned left, followed by non-pinned, followed by pinned right
 */
function getColOffsets({
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
  updateRttuiTable: (sync: boolean) => void;
}) {
  const updateRttuiTableRef = React.useRef(updateRttuiTable);
  updateRttuiTableRef.current = updateRttuiTable;
  const onChange = React.useCallback((sync: boolean) => {
    updateRttuiTableRef.current(sync);
  }, []);
  const virtualizersRef = React.useRef<{
    rowVirtualizer: Virtualizer<any, any>;
    colVirtualizers: {
      header: ColVirtualizer[];
      footer: ColVirtualizer[];
      main: ColVirtualizer;
    };
  }>(null);

  const verScrollCallbackRef = React.useRef<ObserveOffsetCallBack>(undefined);
  const horScrollCallbackRefs = React.useRef<{
    [type in HeaderType]: {
      [groupIndex: number]: ObserveOffsetCallBack;
    };
  }>({
    header: {},
    footer: {},
  });

  const verObserveElementOffset: ObserveElementOffset = React.useCallback(
    (_, cb) => {
      verScrollCallbackRef.current = cb;
      return undefined;
    },
    [],
  );
  const horObserveElementOffset =
    (type: HeaderType, groupIndex: number): ObserveElementOffset =>
    (_, cb) => {
      horScrollCallbackRefs.current[type][groupIndex] = cb;
      return undefined;
    };

  const _slow_allRows = table.getRowModel().rows;

  const rowRefsOb = {
    skin,
    _slow_allRows,
  };
  const rowRefs = React.useRef(rowRefsOb);
  rowRefs.current = rowRefsOb;

  const measuringContext = useMeasureContext();
  const isMeasuring = measuringContext.isMeasuring;

  const getRowOverscan = () => {
    const rowOverscan = isMeasuring?.verticalOverscan ?? uiProps.rowOverscan;
    return rowOverscan;
  };
  const getColOverscan = () => {
    const colOverscan =
      isMeasuring?.horizontalOverscan ?? uiProps.columnOverscan;
    return colOverscan;
  };
  const getRowScrollOffset = () => {
    const rowScrollOffset = isMeasuring?.verticalScrollOffset;
    return rowScrollOffset;
  };
  const getColScrollOffset = () => {
    const colScrollOffset = isMeasuring?.horizontalScrollOffset;
    return colScrollOffset;
  };

  if (!virtualizersRef.current) {
    const _slow_leafHeaders = table.getLeafHeaders();
    virtualizersRef.current = {
      rowVirtualizer: new Virtualizer({
        count: _slow_allRows.length,
        getScrollElement: () => tableContainerRef.current,
        overscan: getRowOverscan(),
        initialOffset: getRowScrollOffset(),
        scrollToFn: (offset) => {
          tableContainerRef.current?.scrollTo({
            top: offset,
          });
        },
        observeElementRect,
        observeElementOffset: verObserveElementOffset,
        estimateSize: () => rowRefs.current.skin.rowHeight,
        getItemKey: (index: number) => rowRefs.current._slow_allRows[index].id,
        onChange: () => {},
        measureElement: (
          element: any,
          entry: ResizeObserverEntry | undefined,
          instance: Virtualizer<HTMLDivElement, any>,
        ) => {
          const defaultSize = measureElement(element, entry, instance);
          return Math.max(defaultSize, rowRefs.current.skin.rowHeight);
        },
        rangeExtractor: (range): number[] => {
          const defaultRange = defaultRangeExtractor(range);
          const next = new Set(defaultRange);

          rowRefs.current._slow_allRows.forEach((row, index) => {
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
            columnOverscan: getColOverscan(),
            onChange: () => {},
            initialOffset: getColScrollOffset(),
            observeElementOffset: horObserveElementOffset("header", 0),
          }),
          _slow_lookup: _slow_leafHeaders,
        },
      },
    };
  } else {
    virtualizersRef.current.rowVirtualizer.setOptions({
      ...virtualizersRef.current.rowVirtualizer.options,
      count: _slow_allRows.length,
      overscan: getRowOverscan(),
    });
  }

  const virtualizers = virtualizersRef.current;

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
    h.filteredHeaderGroups.forEach((group, groupIndex) => {
      if (virtualizers.colVirtualizers[type][groupIndex]) {
        // update the virtualizer options
        const currentVirtualizer =
          virtualizers.colVirtualizers[type][groupIndex];
        currentVirtualizer.virtualizer.setOptions({
          ...currentVirtualizer.virtualizer.options,
          ...getNewColVirtualizerOptions(group._slow_headers),
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
          columnOverscan: getColOverscan(),
          onChange: () => {},
          initialOffset: getColScrollOffset(),
          observeElementOffset: horObserveElementOffset(type, groupIndex),
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
    if (
      cv.options.initialOffset &&
      typeof cv.options.initialOffset === "number"
    ) {
      cv.scrollToOffset(cv.options.initialOffset, {
        behavior: "auto",
      });
    }
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
      // this should initialize the verScrollCallbackRef and horScrollCallbackRef
      cv._willUpdate();
    });

    const verCb = verScrollCallbackRef.current;
    const horCbs = Object.values(horScrollCallbackRefs.current).flatMap((val) =>
      Object.values(val),
    );

    const element = tableContainerRef.current;

    if (!verCb || !element) {
      return;
    }

    let offsetLeft = 0;
    let offsetTop = 0;

    const fallback = supportsScrollend
      ? () => undefined
      : debounce(
          window,
          () => {
            verCb(offsetTop, false);
            horCbs.forEach((cb) => cb(offsetLeft, false));
            onChange(false);
          },
          150,
        );

    const createHandler = (isScrolling: boolean) => () => {
      offsetLeft = element["scrollLeft"];
      offsetTop = element["scrollTop"];
      fallback();
      verCb(offsetTop, isScrolling);
      horCbs.forEach((cb) => cb(offsetLeft, isScrolling));
      onChange(isScrolling);
    };
    const handler = createHandler(true);
    const endHandler = createHandler(false);
    endHandler();

    element.addEventListener("scroll", handler, addEventListenerOptions);
    if (supportsScrollend) {
      element.addEventListener(
        "scrollend",
        endHandler,
        addEventListenerOptions,
      );
    }
    return () => {
      element.removeEventListener("scroll", handler);
      if (supportsScrollend) {
        element.removeEventListener("scrollend", endHandler);
      }
    };
  }, [onChange, tableContainerRef]);

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
  initialOffset,
  observeElementOffset,
}: {
  _slow_allHeaders: Header<any, unknown>[];
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  columnOverscan: number;
  onChange: (sync: boolean) => void;
  initialOffset: number | undefined;
  observeElementOffset: ObserveElementOffset;
}) {
  return new Virtualizer({
    getScrollElement: () => tableContainerRef.current,
    horizontal: true,
    overscan: columnOverscan,
    initialOffset,
    observeElementRect,
    observeElementOffset,
    scrollToFn: (offset) => {
      tableContainerRef.current?.scrollTo({
        left: offset,
      });
    },
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
