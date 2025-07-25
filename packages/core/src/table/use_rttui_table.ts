import { Header, HeaderGroup, Table } from "@tanstack/react-table";
import {
  defaultRangeExtractor,
  measureElement,
  observeElementOffset as libObserveElementOffset,
  observeElementRect,
  VirtualItem,
  Virtualizer,
  VirtualizerOptions,
  Range,
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
  RttuiRef,
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
  /**
   * used to track the difference between the tanstack table instance and the
   * virtualizer refs
   *
   * if outdated then the virtualizer in the ref will be removed
   */
  outdated: boolean;
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
  const _slow_allRows = [
    ...table.getTopRows(),
    ...table.getCenterRows(),
    ...table.getBottomRows(),
  ];

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
      isScrolling: {
        vertical: virtualizers.rowVirtualizer.isScrolling,
        horizontal: virtualizers.colVirtualizers.main.virtualizer.isScrolling,
      },
      isResizingColumn: table.getState().columnSizingInfo.isResizingColumn,
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
  scrollContainerRef,
  skin,
}: {
  table: Table<any>;
  uiProps: UiProps;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
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
    scrollContainerRef,
    uiProps,
    skin,
    updateRttuiTable,
  });

  if (uiProps.tableRef) {
    if (!uiProps.tableRef.current) {
      uiProps.tableRef.current = {} as RttuiRef;
    }
  }

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
  if (
    prev.virtualData.isScrolling.horizontal !==
    next.virtualData.isScrolling.horizontal
  ) {
    diff.push({ type: "is_scrolling", direction: "horizontal" });
  }
  if (
    prev.virtualData.isScrolling.vertical !==
    next.virtualData.isScrolling.vertical
  ) {
    diff.push({ type: "is_scrolling", direction: "vertical" });
  }

  if (prev.virtualData.isResizingColumn !== next.virtualData.isResizingColumn) {
    diff.push({
      type: "is_resizing_column",
      columnId: next.virtualData.isResizingColumn || undefined,
    });
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
          pinnedTotalSize += getProps(vc, i).height;
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
  scrollContainerRef,
  uiProps,
  skin,
  updateRttuiTable,
}: {
  table: Table<any>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
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

  const initialRect = React.useMemo(():
    | undefined
    | {
        width: number;
        height: number;
      } => {
    const width = uiProps.width ?? uiProps.initialWidth;
    const height = uiProps.height ?? uiProps.initialHeight;
    if (width && height) {
      return { width, height };
    }
    return undefined;
  }, [
    uiProps.width,
    uiProps.height,
    uiProps.initialWidth,
    uiProps.initialHeight,
  ]);

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

  const _slow_allRows = [
    ...table.getTopRows(),
    ...table.getCenterRows(),
    ...table.getBottomRows(),
  ];

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
    const colScrollOffset =
      isMeasuring?.horizontalScrollOffset ??
      virtualizersRef.current?.colVirtualizers.main.virtualizer.scrollOffset ??
      undefined;
    return colScrollOffset;
  };

  const _slow_leafHeaders = table.getLeafHeaders();

  /**
   * only when there are no headers or footers
   * then we create a fallback main virtualizer
   */
  const createFallbackMainVirtualizer = () => {
    return createColVirtualizer({
      initialRect,
      _slow_allHeaders: _slow_leafHeaders,
      scrollContainerRef,
      columnOverscan: getColOverscan(),
      initialOffset: getColScrollOffset(),
      observeElementOffset: horObserveElementOffset("header", 0),
      onChange,
    });
  };

  const rowRangeExtractor = (range: Range): number[] => {
    const defaultRange = defaultRangeExtractor(range);
    const center = new Set(defaultRange);

    const top = new Set<number>();
    const bottom = new Set<number>();

    _slow_allRows.forEach((row, index) => {
      const pinned = row.getIsPinned();
      if (pinned) {
        if (pinned === "top") {
          top.add(index);
        } else {
          bottom.add(index);
        }
      }
    });

    const n = new Set(
      [
        [...top],
        [...center].filter((i) => !top.has(i) && !bottom.has(i)),
        [...bottom],
      ].flatMap((arr) => arr.sort((a, b) => a - b)),
    );

    const result = [...n];

    return result;
  };

  if (!virtualizersRef.current) {
    virtualizersRef.current = {
      rowVirtualizer: new Virtualizer({
        initialRect,
        count: _slow_allRows.length,
        getScrollElement: () => scrollContainerRef.current,
        overscan: getRowOverscan(),
        initialOffset: getRowScrollOffset(),
        scrollToFn: (offset) => {
          scrollContainerRef.current?.scrollTo({
            top: offset,
          });
        },
        observeElementRect,
        observeElementOffset: verObserveElementOffset,
        estimateSize: () => rowRefs.current.skin.rowHeight,
        getItemKey: (index: number) => rowRefs.current._slow_allRows[index].id,
        onChange: (_instance, sync) => {
          if (!sync) {
            // this happens for example when resizing a virtual item
            onChange(false);
          }
        },
        measureElement: (
          element: any,
          entry: ResizeObserverEntry | undefined,
          instance: Virtualizer<HTMLDivElement, any>,
        ) => {
          const defaultSize = measureElement(element, entry, instance);
          return Math.max(defaultSize, rowRefs.current.skin.rowHeight);
        },
        rangeExtractor: rowRangeExtractor,
      }),
      colVirtualizers: {
        header: [],
        footer: [],
        main: {
          groupIndex: 0,
          virtualizer: createFallbackMainVirtualizer(),
          _slow_lookup: _slow_leafHeaders,
          outdated: false,
        },
      },
    };
  } else {
    // mark all virtualizers in the ref as outdated
    // later mark the ones that are not outdated as not outdated
    Object.values(virtualizersRef.current.colVirtualizers)
      .flat()
      .forEach((cv) => {
        cv.outdated = true;
      });

    // update the row virtualizer
    virtualizersRef.current.rowVirtualizer.setOptions({
      ...virtualizersRef.current.rowVirtualizer.options,
      count: _slow_allRows.length,
      overscan: getRowOverscan(),
      rangeExtractor: rowRangeExtractor,
    });
  }

  const virtualizers = virtualizersRef.current;

  //#region update or create column virtualizers

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
      // a virtualizer already exists in the ref,
      // therefore just update the options
      if (virtualizers.colVirtualizers[type][groupIndex]) {
        // update the virtualizer options
        const currentVirtualizer =
          virtualizers.colVirtualizers[type][groupIndex];
        currentVirtualizer.virtualizer.setOptions({
          ...currentVirtualizer.virtualizer.options,
          ...getNewColVirtualizerOptions(group._slow_headers, onChange),
        });
        // update the lookup
        currentVirtualizer._slow_lookup = group._slow_headers;
        currentVirtualizer.outdated = false;
        return;
      }

      // there is not virtualizer in the ref,
      // therefore create a new one
      virtualizers.colVirtualizers[type][groupIndex] = {
        groupIndex,
        virtualizer: createColVirtualizer({
          initialRect,
          _slow_allHeaders: group._slow_headers,
          scrollContainerRef,
          columnOverscan: getColOverscan(),
          initialOffset: getColScrollOffset(),
          observeElementOffset: horObserveElementOffset(type, groupIndex),
          onChange,
        }),
        _slow_lookup: group._slow_headers,
        outdated: false,
      };
    });
  }

  // by default the main virtualizer should be the last header or the first footer
  // if there are no headers or footers then the main virtualizer will be the fallback virtualizer
  virtualizers.colVirtualizers.main =
    virtualizers.colVirtualizers.header[
      virtualizers.colVirtualizers.header.length - 1
    ] ??
    virtualizers.colVirtualizers.footer[0] ??
    virtualizers.colVirtualizers.main;

  // if there are no headers or footers then the main virtualizer will be the fallback virtualizer
  if (
    virtualizers.colVirtualizers.footer.length === 0 &&
    virtualizers.colVirtualizers.header.length === 0
  ) {
    // update the fallback virtualizer
    const main = virtualizers.colVirtualizers.main;
    main.virtualizer.setOptions({
      ...main.virtualizer.options,
      ...getNewColVirtualizerOptions(_slow_leafHeaders, onChange),
    });
    // update the lookup
    main._slow_lookup = _slow_leafHeaders;
    main.outdated = false;
    main.groupIndex = 0;
  }

  //#endregion

  //#region cleanup outdated virtualizers
  for (const type of ["header", "footer"] as const) {
    const arr = virtualizers.colVirtualizers[type];
    const cbs = horScrollCallbackRefs.current[type];
    for (let i = arr.length - 1; i >= 0; i--) {
      const cv = arr[i];
      if (cv.outdated) {
        // the didmount function only returns the cleanup function
        // it doesn't do anything else
        cv.virtualizer._didMount()();
        arr.splice(i, 1);
        delete cbs[cv.groupIndex];
      }
    }
  }
  //#endregion

  /**
   * when resizing a column, this function is used to get the index of the column
   * in the header group
   */
  const getIndex = (colId: string) => {
    const headerGroup = headerGroups.find((hg) => hg.headerIndices[colId]);
    if (!headerGroup) {
      return undefined;
    }
    return headerGroup.headerIndices[colId];
  };

  const allVirtualizers = new Set(
    Object.values(virtualizers.colVirtualizers)
      .flat()
      .map((cv) => cv.virtualizer),
  );

  allVirtualizers.add(virtualizers.rowVirtualizer);

  // we need to configure all virtualizers
  allVirtualizers.forEach((cv) => {
    cv.shouldAdjustScrollPositionOnItemSizeChange = undefined;
    cv.calculateRange();
    if (
      isMeasuring &&
      cv.options.initialOffset &&
      typeof cv.options.initialOffset === "number"
    ) {
      // while measuring a column, after double clicking a resizer
      // then the measuring instance will need to scroll to
      // the same offset as the non measuring instance.
      // Just setting initialOffset isn't enough
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

  // handle column resizing
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

  // cleanup all virtualizers when unmounting
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
    // should always intiialize all virtualizers,
    // which will initialize the verScrollCallbackRef and horScrollCallbackRef
    // a virtualizer can only be initialized once
    Array.from(allVirtualizersRef.current).forEach((cv) => {
      // this should initialize the verScrollCallbackRef and horScrollCallbackRef
      cv._willUpdate();
    });
  });
  // we need to do this roundabout way because we only
  // want one scroll event listener, but we want all the
  // virtualizers to be hooked up to it
  // this logic is the same more or less as the libObserveElementOffset
  React.useLayoutEffect(() => {
    const getCallbacks = () => {
      const verCb = verScrollCallbackRef.current;
      if (!verCb) {
        throw new Error("verScrollCallbackRef is not set");
      }
      const horCbs = Object.values(horScrollCallbackRefs.current).flatMap(
        (val) => Object.values(val),
      );
      return { verCb, horCbs };
    };

    const element = scrollContainerRef.current;

    if (!element) {
      return;
    }

    let offsetLeft = 0;
    let offsetTop = 0;

    const fallback = supportsScrollend
      ? () => undefined
      : debounce(
          window,
          () => {
            const { verCb, horCbs } = getCallbacks();
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
      const { verCb, horCbs } = getCallbacks();
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
  }, [onChange, scrollContainerRef]);

  return virtualizers;
}

function getNewColVirtualizerOptions(
  _slow_allHeaders: Header<any, unknown>[],
  onChange: (sync: boolean) => void,
): Pick<
  VirtualizerOptions<any, any>,
  "count" | "estimateSize" | "rangeExtractor" | "getItemKey" | "onChange"
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
    onChange: (_instance, sync) => {
      if (!sync) {
        // this happens for example when resizing a virtual item
        onChange(false);
      }
    },
  };
}
function createColVirtualizer({
  _slow_allHeaders,
  scrollContainerRef,
  columnOverscan,
  initialOffset,
  observeElementOffset,
  onChange,
  initialRect,
}: {
  _slow_allHeaders: Header<any, unknown>[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  columnOverscan: number;
  initialOffset: number | undefined;
  onChange: (sync: boolean) => void;
  observeElementOffset: ObserveElementOffset;
  initialRect:
    | {
        width: number;
        height: number;
      }
    | undefined;
}) {
  return new Virtualizer({
    getScrollElement: () => scrollContainerRef.current,
    initialRect,
    horizontal: true,
    overscan: columnOverscan,
    initialOffset,
    observeElementRect,
    observeElementOffset,
    scrollToFn: (offset) => {
      scrollContainerRef.current?.scrollTo({
        left: offset,
      });
    },
    ...getNewColVirtualizerOptions(_slow_allHeaders, onChange),
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
