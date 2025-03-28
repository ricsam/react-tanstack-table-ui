import { Header, HeaderGroup } from "@tanstack/react-table";
import {
  defaultRangeExtractor,
  elementScroll,
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
import { getColVirtualizedOffsets } from "./get_col_virtualized_offset";
import { VirtualHeaderGroup } from "./header_group";
import { VirtualHeader } from "./virtual_header/types";
import { VirtualHeaderGroupCache } from "./virtual_header_group_cache";

const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;

const getVirtualHeaderGroup = (
  group: HeaderGroup<any>,
  virtualColumns: VirtualItem[],
  totalSize: number,
  type: "header" | "footer",
): VirtualHeaderGroup => {
  const getVirtualHeader = (header: Header<any, unknown>): VirtualHeader => {
    const isPinned = getIsPinned(header);

    return {
      header,
      headerId: header.id,
      isDragging: false,
      isPinned: mapColumnPinningPositionToPinPos(isPinned),
      dndStyle: {},
      width: header.getSize(),
      headerIndex: header.index,
      type,
    };
  };

  const { offsetLeft, offsetRight } = getColVirtualizedOffsets({
    virtualColumns,
    getIsPinned(vcIndex) {
      const header = group.headers[vcIndex];
      return mapColumnPinningPositionToPinPos(getIsPinned(header));
    },
    totalSize,
  });

  return {
    id: group.id,
    headers: virtualColumns.map((vc) => {
      const header = group.headers[vc.index];
      return getVirtualHeader(header);
    }),
    offsetLeft,
    offsetRight,
    headerGroup: group,
  };
};

export function useHeaderGroupVirtualizers(props: {
  headerGroups: HeaderGroup<any>[];
  type: "footer" | "header";
}) {
  const { tableContainerRef, table, config } = useTableContext();
  const tableState = table.getState();
  const { filteredHeaderGroups, headerIndices } = React.useMemo(() => {
    const headerIndices: Record<
      string,
      undefined | { headerIndex: number; groupIndex: number }
    > = {};
    const filteredHeaderGroups: HeaderGroup<any>[] = [];
    props.headerGroups.forEach((group) => {
      let hasVisibleHeader = false;
      const groupHeaderIndices: Record<
        string,
        { headerIndex: number; groupIndex: number }
      > = {};
      group.headers.forEach((header, j) => {
        groupHeaderIndices[header.column.id] = {
          headerIndex: j,
          groupIndex: filteredHeaderGroups.length,
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

  const baseColVirtOpts = React.useCallback(
    (
      headerGroup: HeaderGroup<any>,
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
    },
    [tableContainerRef, config.columnOverscan],
  );

  const rerender = React.useReducer(() => ({}), {})[1];

  const headerColVirtualizerOptions = React.useMemo(() => {
    return filteredHeaderGroups.map(
      (headerGroup): VirtualizerOptions<HTMLDivElement, Element> => {
        return {
          ...baseColVirtOpts(headerGroup),
          count: headerGroup.headers.length,
          estimateSize: (index) => headerGroup.headers[index].getSize(),
          observeElementRect,
          observeElementOffset,
          scrollToFn: elementScroll,
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
  }, [baseColVirtOpts, filteredHeaderGroups, rerender]);

  const headerColVirtualizers = React.useMemo(() => {
    return headerColVirtualizerOptions.map((options) => {
      return new Virtualizer(options);
    });
  }, [headerColVirtualizerOptions]);

  const columnResizingInfo = tableState.columnSizingInfo;

  useIsomorphicLayoutEffect(() => {
    if (columnResizingInfo.isResizingColumn) {
      const indices = headerIndices[columnResizingInfo.isResizingColumn];
      if (!indices) {
        return;
      }
      const { headerIndex, groupIndex } = indices;

      const virtualizer = headerColVirtualizers[groupIndex];
      virtualizer.resizeItem(
        headerIndex,
        tableState.columnSizing[columnResizingInfo.isResizingColumn],
      );
    }
  }, [
    columnResizingInfo.isResizingColumn,
    headerColVirtualizers,
    headerIndices,
    tableState.columnSizing,
  ]);

  headerColVirtualizers.forEach((cv, i) => {
    cv.shouldAdjustScrollPositionOnItemSizeChange = undefined;
    cv.setOptions(headerColVirtualizerOptions[i]);
    cv.calculateRange();
  });

  useIsomorphicLayoutEffect(() => {
    const cleanups = headerColVirtualizers.map((cv) => {
      return cv._didMount();
    });
    return () => {
      cleanups.forEach((cleanup) => {
        cleanup();
      });
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    headerColVirtualizers.forEach((cv) => {
      cv._willUpdate();
    });
  });

  const [virtualHeaderGroupCache] = React.useState(() => {
    const virtualHeaderGroupCache = new VirtualHeaderGroupCache();
    return virtualHeaderGroupCache;
  });

  const virtualHeaderGroups = filteredHeaderGroups.map((group, i) => {
    const virtualizer = headerColVirtualizers[i];
    const virtualColumns = virtualizer.getVirtualItems();
    const totalSize = virtualizer.getTotalSize();
    return getVirtualHeaderGroup(group, virtualColumns, totalSize, props.type);
  });

  return virtualHeaderGroupCache.update(virtualHeaderGroups, tableState);
}
