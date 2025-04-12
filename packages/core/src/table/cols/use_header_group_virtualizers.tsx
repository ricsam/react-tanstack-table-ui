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
import {
  getIsPinned,
  mapColumnPinningPositionToPinPos,
  useTableProps,
} from "../../utils";
import { useTableContext } from "../table_context";
import { CombinedHeaderGroup } from "../types";
import { getColVirtualizedOffsets } from "./get_col_virtualized_offset";
import { VirtualHeaderCell, VirtualHeaderGroup } from "../types";
import { VirtualHeaderGroupCache } from "./virtual_header_group_cache";
import { HeaderIndex } from "./virtual_header/types";

const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;

const getVirtualHeaderGroup = (
  group: CombinedHeaderGroup,
  virtualColumns: VirtualItem[],
  totalSize: number,
  type: "header" | "footer",
): VirtualHeaderGroup => {
  const getVirtualHeader = (
    headerFn: () => Header<any, unknown>,
    headerIndex: number,
    start: number,
  ): VirtualHeaderCell => {
    const header = headerFn();
    const isPinned = getIsPinned(header);

    const width = header.getSize();
    const allHeaders = group.headers();

    const isIndexPinned = (index: number) =>
      allHeaders[index] ? getIsPinned(allHeaders[index]) : false;

    let isLastPinned = false;
    let isFirstPinned = false;
    if (isPinned === "left") {
      isLastPinned = !isIndexPinned(headerIndex + 1);
      isFirstPinned = headerIndex === 0;
    } else if (isPinned === "right") {
      isLastPinned = !isIndexPinned(headerIndex - 1);
      isFirstPinned = headerIndex === allHeaders.length - 1;
    }
    let isLast = false;
    let isFirst = false;

    if (headerIndex === 0) {
      isFirst = true;
    }
    if (headerIndex === allHeaders.length - 1) {
      isLast = true;
    }
    let isFirstCenter = false;
    let isLastCenter = false;
    if (isPinned === false) {
      isLastCenter =
        !allHeaders[headerIndex + 1] ||
        isIndexPinned(headerIndex + 1) === "right";
      isFirstCenter =
        !allHeaders[headerIndex - 1] ||
        isIndexPinned(headerIndex - 1) === "left";
    }

    return {
      header: headerFn,
      id: header.id,
      isDragging: false,
      isPinned: mapColumnPinningPositionToPinPos(isPinned),
      dndStyle: {},
      width,
      headerIndex,
      type,
      start,
      end: start + width,
      columnId: header.column.id,
      isLastPinned,
      isFirstPinned,
      isLast,
      isFirst,
      isFirstCenter,
      isLastCenter,
    };
  };

  const headers = virtualColumns.map((vc) => {
    return getVirtualHeader(
      () => {
        return group.headers()[vc.index];
      },
      vc.index,
      vc.start,
    );
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
  };
};

export function useHeaderGroupVirtualizers(props: {
  headerGroups: CombinedHeaderGroup[];
  type: "footer" | "header";
}) {
  const { tableContainerRef, config } = useTableContext();
  const { filteredHeaderGroups, headerIndices } = React.useMemo(() => {
    const headerIndices: Record<string, undefined | HeaderIndex[]> = {};
    const filteredHeaderGroups: CombinedHeaderGroup[] = [];

    props.headerGroups.forEach((group) => {
      let hasVisibleHeader = false;
      const groupHeaderIndices: Record<string, HeaderIndex[]> = {};
      group.headers().forEach((header, j) => {
        if (!groupHeaderIndices[header.column.id]) {
          groupHeaderIndices[header.column.id] = [];
        }
        groupHeaderIndices[header.column.id].push({
          headerIndex: j,
          groupIndex: filteredHeaderGroups.length,
          columnId: header.column.id,
          headerId: header.id,
          header,
        });
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
    return {
      getScrollElement: () => tableContainerRef.current,
      horizontal: true,
      // debug: true,
      overscan: config.columnOverscan, //how many columns to render on each side off screen each way (adjust this for performance)
      rangeExtractor: (range) => {
        const headersInstance = headerGroup.headers();
        const defaultRange = defaultRangeExtractor(range);
        const next = new Set(defaultRange);

        for (let i = 0; i < headersInstance.length; i++) {
          const header = headersInstance[i];
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
        const headersInstance = headerGroup.headers();
        return headersInstance[index].id;
      },
    };
  };

  const rerender = React.useReducer(() => ({}), {})[1];

  const headerColVirtualizerOptions = filteredHeaderGroups.map(
    (headerGroup): VirtualizerOptions<HTMLDivElement, Element> => {
      return {
        // todo, don't call here, instead call when headerColVirterOptions is used
        ...baseColVirtOpts(headerGroup),
        count: headerGroup.headers().length,
        estimateSize: (index) => headerGroup.headers()[index].getSize(),
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

  const { columnSizingInfo, columnSizing } = useTableProps((table) => {
    const { columnSizingInfo, columnSizing } = table.getState();
    return { columnSizingInfo, columnSizing };
  });

  useIsomorphicLayoutEffect(() => {
    if (columnSizingInfo.isResizingColumn) {
      const indices = headerIndices[columnSizingInfo.isResizingColumn];
      if (!indices) {
        return;
      }
      indices.forEach(({ headerIndex, groupIndex, header }) => {
        const virtualizer = headerColVirtualizers.current[groupIndex];
        const headerSize = header.getSize();

        virtualizer.resizeItem(headerIndex, headerSize);
      });
    }
  }, [
    columnSizingInfo.isResizingColumn,
    headerColVirtualizers,
    headerIndices,
    columnSizing,
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

  const result = virtualHeaderGroupCache.update(virtualHeaderGroups);

  return result;
}
