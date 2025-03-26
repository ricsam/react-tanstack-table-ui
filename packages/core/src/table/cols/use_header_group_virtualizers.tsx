import { flexRender, Header, HeaderGroup, Table } from "@tanstack/react-table";
import {
  defaultRangeExtractor,
  elementScroll,
  observeElementOffset,
  observeElementRect,
  Virtualizer,
  VirtualizerOptions,
} from "@tanstack/react-virtual";
import React, { CSSProperties } from "react";
import { flushSync } from "react-dom";
import { getIsPinned, mapColumnPinningPositionToPinPos } from "../../utils";
import { useTableContext } from "../table_context";
import { VirtualHeader } from "./draggable_table_header";
import { getColVirtualizedOffsets } from "./get_col_virtualized_offset";
import { VirtualHeaderGroup } from "./header_group";

const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;

const getVirtualHeaderGroup = (
  group: HeaderGroup<any>,
  type: "footer" | "header",
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  table: Table<any>,
): VirtualHeaderGroup => {
  const getVirtualHeader = (header: Header<any, unknown>): VirtualHeader => {
    const stickyStyle: CSSProperties = {};
    const isPinned = getIsPinned(header);

    if (isPinned) {
      stickyStyle.position = "sticky";

      const leafs = header.subHeaders.length > 0 ? header.subHeaders : [header];
      const firstLeaf = leafs[0];
      const lastLeaf = leafs[leafs.length - 1];

      const pinnedRightLeftPos =
        table.getTotalSize() -
        (lastLeaf.column.getAfter("right") + header.column.getSize());

      const transformedRightLeftPos = pinnedRightLeftPos;

      const transformedRightRightPos =
        table.getTotalSize() -
        (transformedRightLeftPos + header.column.getSize());

      if (isPinned === "left") {
        stickyStyle.left = firstLeaf.getStart("left");
      } else {
        stickyStyle.right = transformedRightRightPos;
      }
    }
    return {
      canDrag: header.isPlaceholder ? false : true,
      canPin: header.column.getCanPin(),
      canResize: header.column.getCanResize(),
      children: header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef[type], header.getContext()),
      header,
      headerId: header.id,
      isDragging: false,
      isPinned: mapColumnPinningPositionToPinPos(isPinned),
      dndStyle: {},
      stickyStyle,
      width: header.getSize(),
      colIndex: header.index,
      start: header.getStart(),
    };
  };

  const virtualColumns = virtualizer.getVirtualItems();

  const { offsetLeft, offsetRight } = getColVirtualizedOffsets({
    virtualColumns,
    getIsPinned(vcIndex) {
      const header = group.headers[vcIndex];
      return !!header.column.getIsPinned();
    },
    totalSize: virtualizer.getTotalSize(),
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
  const { tableContainerRef, table } = useTableContext();
  const filteredHeaderGroups = props.headerGroups.filter((group) => {
    return group.headers.some((header) => header.column.columnDef[props.type]);
  });

  const _draggedIndexRef = React.useRef<(number | null)[]>(
    filteredHeaderGroups.map(() => null),
  );

  const visibleColsOutsideVirtualRange = React.useRef(
    filteredHeaderGroups.map(() => new Set<number>()),
  );

  const getDraggedIndex = (headerIndex: number) =>
    _draggedIndexRef.current[headerIndex];

  const defaultColWindowRef = React.useRef<number[] | null>(null);

  const baseColVirtOpts = React.useCallback(
    (
      headerIndex: number,
    ): Pick<
      VirtualizerOptions<HTMLDivElement, Element>,
      | "getScrollElement"
      | "horizontal"
      | "overscan"
      | "rangeExtractor"
      | "debug"
    > => {
      const headers = filteredHeaderGroups[headerIndex].headers;
      return {
        getScrollElement: () => tableContainerRef.current,
        horizontal: true,
        // debug: true,
        overscan: 1, //how many columns to render on each side off screen each way (adjust this for performance)
        rangeExtractor: (range) => {
          const draggedIndex = getDraggedIndex(headerIndex);
          const defaultRange = defaultRangeExtractor(range);
          const next = new Set(defaultRange);

          const defaultRangeSet = new Set(defaultRange);

          defaultColWindowRef.current = [...defaultRangeSet].sort(
            (a, b) => a - b,
          );

          if (draggedIndex !== null) {
            if (!next.has(draggedIndex)) {
              next.add(draggedIndex);
              visibleColsOutsideVirtualRange.current[headerIndex].add(
                draggedIndex,
              );
            } else {
              visibleColsOutsideVirtualRange.current[headerIndex].delete(
                draggedIndex,
              );
            }
          }
          const pinnedHeaders: Header<any, unknown>[] = [];
          const unpinnedHeaders: Header<any, unknown>[] = [];
          for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            if (header.column.getIsPinned()) {
              pinnedHeaders.push(header);
            } else {
              unpinnedHeaders.push(header);
            }
          }
          pinnedHeaders.forEach((col) => {
            const index = col.index;
            if (index !== -1) {
              if (!next.has(index)) {
                next.add(index);
                visibleColsOutsideVirtualRange.current[headerIndex].add(index);
              } else {
                visibleColsOutsideVirtualRange.current[headerIndex].delete(
                  index,
                );
              }
            }
          });
          unpinnedHeaders.forEach((col) => {
            const index = col.index;
            if (index === draggedIndex) {
              return;
            }
            if (
              visibleColsOutsideVirtualRange.current[headerIndex].has(index)
            ) {
              visibleColsOutsideVirtualRange.current[headerIndex].delete(index);
            }
          });
          // console.log(
          //   "range",
          //   draggedIndex,
          //   [...next].sort((a, b) => a - b),
          // );
          const sortedRange = [...next].sort((a, b) => {
            return a - b;
          });
          return sortedRange;
        },
      };
    },
    [filteredHeaderGroups, tableContainerRef],
  );

  const rerender = React.useReducer(() => ({}), {})[1];

  const headerColVirtualizerOptions = React.useMemo(() => {
    return filteredHeaderGroups.map(
      (
        headerGroup,
        headerIndex,
      ): VirtualizerOptions<HTMLDivElement, Element> => {
        return {
          ...baseColVirtOpts(headerIndex),
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

  const [headerColVirtualizers] = React.useState(() => {
    return headerColVirtualizerOptions.map((options) => {
      return new Virtualizer(options);
    });
  });

  if (headerColVirtualizers.length > 0) {
    headerColVirtualizers[
      headerColVirtualizers.length - 1
    ].shouldAdjustScrollPositionOnItemSizeChange =
      // when moving columns we want to adjust the scroll position
      // when resizing columns we don't want to adjust the scroll position
      table.getState().columnSizingInfo.isResizingColumn === false
        ? () => {
            return true;
          }
        : undefined;
  }

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

  headerColVirtualizers.forEach((cv, i) => {
    cv.setOptions(headerColVirtualizerOptions[i]);
    filteredHeaderGroups[i].headers.forEach((header, j) => {
      cv.resizeItem(j, header.getSize());
    });
  });

  //different virtualization strategy for columns - instead of absolute and translateY, we add empty columns to the left and right
  const getVirtualHeaders = (headerIndex: number) => {
    const virtualizer = headerColVirtualizers[headerIndex];
    let virtualPaddingLeft: number | undefined;
    let virtualPaddingRight: number | undefined;

    if (!virtualizer) {
      console.log("no virtualizer", headerIndex, headerColVirtualizers);
    }
    const virtualColumns = virtualizer.getVirtualItems();

    if (virtualColumns.length) {
      const virtualColumnsStart = virtualColumns.find(
        (vc) =>
          !visibleColsOutsideVirtualRange.current[headerIndex].has(vc.index),
      );
      const virtualColumnsEnd = [...virtualColumns]
        .reverse()
        .find(
          (vc) =>
            !visibleColsOutsideVirtualRange.current[headerIndex].has(vc.index),
        );
      // const virtualColumnsStart = virtualColumns[0];
      // const virtualColumnsEnd = [...virtualColumns].reverse()[0];

      virtualPaddingLeft = virtualColumnsStart?.start ?? 0;
      virtualPaddingRight =
        virtualizer.getTotalSize() - (virtualColumnsEnd?.end ?? 0);
    }
    return {
      virtualPaddingLeft,
      virtualPaddingRight,
      virtualColumns,
      virtualizer,
    };
  };

  return filteredHeaderGroups.map((group, i): VirtualHeaderGroup => {
    const { virtualizer } = getVirtualHeaders(i);
    return getVirtualHeaderGroup(group, props.type, virtualizer, table);
  });
}
