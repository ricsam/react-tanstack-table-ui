import { Header } from "@tanstack/react-table";
import {
  defaultRangeExtractor,
  observeElementOffset,
  observeElementRect,
  VirtualItem,
  Virtualizer,
  VirtualizerOptions,
} from "@tanstack/react-virtual";
import React from "react";
import { flushSync } from "react-dom";
import { getIsPinned, mapColumnPinningPositionToPinPos } from "../../utils";
import { useTableContext } from "../table_context";
import { CombinedHeaderGroup } from "../types";
import { getColVirtualizedOffsets } from "./get_col_virtualized_offset";
import { VirtualHeaderGroup } from "./header_group";
import { VirtualHeader } from "./virtual_header/types";
import { VirtualHeaderGroupCache } from "./virtual_header_group_cache";

const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;

const getVirtualHeaderGroup = (
  group: CombinedHeaderGroup,
  virtualColumns: VirtualItem[],
  totalSize: number,
  type: "header" | "footer",
): VirtualHeaderGroup => {
  const getVirtualHeader = (header: Header<any, unknown>): VirtualHeader => {
    const isPinned = getIsPinned(header);

    const width = header.getSize();
    return {
      header,
      headerId: header.id,
      isDragging: false,
      isPinned: mapColumnPinningPositionToPinPos(isPinned),
      dndStyle: {},
      width,
      headerIndex: header.index,
      type,
      start: header.getStart(),
      end: header.getStart() + width,
    };
  };

  const headers = virtualColumns.map((vc) => {
    const header = group.headers[vc.index];
    return getVirtualHeader(header);
  });

  const { offsetLeft, offsetRight } = getColVirtualizedOffsets({
    headers,
    totalSize,
  });

  return {
    id: group.id,
    headers,
    offsetLeft,
    offsetRight,
    headerGroup: group,
  };
};

type HeaderIndex = {
  headerIndex: number;
  groupIndex: number;
  columnId: string;
  headerId: string;
  header: Header<any, unknown>;
};

export function useHeaderGroupVirtualizers(props: {
  headerGroups: CombinedHeaderGroup[];
  type: "footer" | "header";
}) {
  const { tableContainerRef, table, config } = useTableContext();
  const tableState = table.getState();
  const { filteredHeaderGroups, headerIndices } = React.useMemo(() => {
    const headerIndices: Record<string, undefined | HeaderIndex> = {};
    const filteredHeaderGroups: CombinedHeaderGroup[] = [];

    props.headerGroups.forEach((group) => {
      let hasVisibleHeader = false;
      const groupHeaderIndices: Record<string, HeaderIndex> = {};
      group.headers.forEach((header, j) => {
        groupHeaderIndices[header.column.id] = {
          headerIndex: j,
          groupIndex: filteredHeaderGroups.length,
          columnId: header.column.id,
          headerId: header.id,
          header,
        };
        if (header.column.columnDef[props.type]) {
          hasVisibleHeader = true;
        }
      });
      if (hasVisibleHeader) {
        filteredHeaderGroups.push(group);
        Object.assign(headerIndices, groupHeaderIndices);
      }
    });
    return {
      filteredHeaderGroups,
      headerIndices,
    };
  }, [props.headerGroups, props.type]);

  const baseColVirtOpts = (
    headerGroup: CombinedHeaderGroup,
  ): Pick<
    VirtualizerOptions<HTMLDivElement, Element>,
    | "getScrollElement"
    | "horizontal"
    | "overscan"
    | "rangeExtractor"
    | "debug"
    | "getItemKey"
  > => {
    const headers = headerGroup.headers;
    return {
      getScrollElement: () => tableContainerRef.current,
      horizontal: true,
      // debug: true,
      overscan: config.columnOverscan, //how many columns to render on each side off screen each way (adjust this for performance)
      rangeExtractor: (range) => {
        const defaultRange = defaultRangeExtractor(range);
        const next = new Set(defaultRange);

        for (let i = 0; i < headers.length; i++) {
          const header = headers[i];
          if (getIsPinned(header)) {
            next.add(i);
          }
        }

        const sortedRange = [...next].sort((a, b) => {
          return a - b;
        });
        return sortedRange;
      },
      getItemKey(index) {
        return headers[index].id;
      },
    };
  };

  const rerender = React.useReducer(() => ({}), {})[1];

  const headerColVirtualizerOptions = filteredHeaderGroups.map(
    (headerGroup): VirtualizerOptions<HTMLDivElement, Element> => {
      return {
        ...baseColVirtOpts(headerGroup),
        count: headerGroup.headers.length,
        estimateSize: (index) => headerGroup.headers[index].getSize(),
        observeElementRect,
        observeElementOffset,
        scrollToFn: () => {},
        onChange: (_, sync) => {
          if (sync) {
            flushSync(rerender);
          } else {
            rerender();
          }
        },
      };
    },
  );

  const headerColVirtualizersCache = React.useRef<
    Virtualizer<HTMLDivElement, Element>[]
  >([]);
  const headerColVirtualizers = React.useRef<
    Virtualizer<HTMLDivElement, Element>[]
  >([]);

  if (
    headerColVirtualizerOptions.length >
    headerColVirtualizersCache.current.length
  ) {
    const prevVirtualizer: Virtualizer<HTMLDivElement, Element> | undefined =
      headerColVirtualizers.current[headerColVirtualizers.current.length - 1];
    for (
      let i = headerColVirtualizers.current.length;
      i < headerColVirtualizerOptions.length;
      i++
    ) {
      const newVirtualizer = new Virtualizer({
        ...headerColVirtualizerOptions[i],
        initialOffset: prevVirtualizer?.scrollOffset ?? undefined,
      });
      headerColVirtualizersCache.current.push(newVirtualizer);
    }
  }

  headerColVirtualizers.current = headerColVirtualizersCache.current.slice(
    0,
    headerColVirtualizerOptions.length,
  );

  const columnResizingInfo = tableState.columnSizingInfo;

  useIsomorphicLayoutEffect(() => {
    if (columnResizingInfo.isResizingColumn) {
      const indices = headerIndices[columnResizingInfo.isResizingColumn];
      if (!indices) {
        return;
      }
      const { headerIndex, groupIndex, header } = indices;

      const virtualizer = headerColVirtualizers.current[groupIndex];
      const headerSize = header.getSize();

      virtualizer.resizeItem(headerIndex, headerSize);
    }
  }, [
    columnResizingInfo.isResizingColumn,
    headerColVirtualizers,
    headerIndices,
    tableState.columnSizing,
  ]);

  headerColVirtualizers.current.forEach((cv, i) => {
    cv.shouldAdjustScrollPositionOnItemSizeChange = undefined;
    cv.setOptions({
      ...headerColVirtualizerOptions[i],
      initialOffset: cv.options.initialOffset,
    });
    cv.calculateRange();
  });

  useIsomorphicLayoutEffect(() => {
    const cleanups = headerColVirtualizers.current.map((cv) => {
      return cv._didMount();
    });
    return () => {
      cleanups.forEach((cleanup) => {
        cleanup();
      });
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    headerColVirtualizers.current.forEach((cv) => {
      cv._willUpdate();
    });
  });

  const [virtualHeaderGroupCache] = React.useState(() => {
    const virtualHeaderGroupCache = new VirtualHeaderGroupCache();
    return virtualHeaderGroupCache;
  });

  const virtualHeaderGroups = filteredHeaderGroups.map((group, i) => {
    const virtualizer = headerColVirtualizers.current[i];
    const virtualColumns = virtualizer.getVirtualItems();
    const totalSize = virtualizer.getTotalSize();
    return getVirtualHeaderGroup(group, virtualColumns, totalSize, props.type);
  });

  const result = virtualHeaderGroupCache.update(
    virtualHeaderGroups,
    tableState,
  );

  return result;
}
