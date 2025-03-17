import { Header, HeaderGroup, Table } from "@tanstack/react-table";
import React from "react";
import {
  defaultRangeExtractor,
  elementScroll,
  observeElementOffset,
  observeElementRect,
  Virtualizer,
  VirtualizerOptions,
} from "../lib/react-virtual";
import { flushSync } from "react-dom";

const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function useHeaderGroupVirtualizers(props: {
  headerGroups: HeaderGroup<any>[];
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  table: Table<any>;
  type: "footer" | "header";
  rowHeight: number;
}) {
  const headerGroups = React.useMemo(
    () =>
      props.headerGroups.filter((group) => {
        return group.headers.some(
          (header) => header.column.columnDef[props.type],
        );
      }),
    [props.headerGroups, props.type],
  );

  const _draggedIndexRef = React.useRef<(number | null)[]>(
    headerGroups.map(() => null),
  );

  const updateDraggedIndex = (headerIndex: number, val: number | null) => {
    if (!val && _draggedIndexRef.current[headerIndex]) {
      visibleColsOutsideVirtualRange.current[headerIndex].delete(
        _draggedIndexRef.current[headerIndex],
      );
    }
    _draggedIndexRef.current[headerIndex] = val;
  };

  const updateAllDraggedIndexes = (val: number | null) => {
    headerGroups.forEach((_, headerIndex) => {
      updateDraggedIndex(headerIndex, val);
    });
  };

  const visibleColsOutsideVirtualRange = React.useRef(
    headerGroups.map(() => new Set<number>()),
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
      const headers = headerGroups[headerIndex].headers;
      return {
        getScrollElement: () => props.tableContainerRef.current,
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
    [headerGroups, props.tableContainerRef],
  );

  const rerender = React.useReducer(() => ({}), {})[1];

  const headerColVirtualizerOptions = React.useMemo(() => {
    return headerGroups.map(
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
          onChange: (instance, sync) => {
            if (sync) {
              flushSync(rerender);
            } else {
              rerender();
            }
          },
        };
      },
    );
  }, [baseColVirtOpts, headerGroups, rerender]);

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
      props.table.getState().columnSizingInfo.isResizingColumn === false
        ? (item, delta, instance) => {
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
    headerGroups[i].headers.forEach((header, j) => {
      cv.resizeItem(j, header.getSize());
    });
  });

  //different virtualization strategy for columns - instead of absolute and translateY, we add empty columns to the left and right
  const getVirtualHeaders = (headerIndex: number) => {
    const virtualizer = headerColVirtualizers[headerIndex];
    let virtualPaddingLeft: number | undefined;
    let virtualPaddingRight: number | undefined;

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

  return {
    headerGroups,
    getVirtualHeaders,
    headerColVirtualizers,
    updateAllDraggedIndexes,
    updateDraggedIndex,
    defaultColWindowRef,
    height: props.rowHeight * headerGroups.length,
    body: {
      headerGroup:
        props.type === "header"
          ? headerGroups[headerGroups.length - 1]
          : headerGroups[0],
      virtualizer:
        props.type === "header"
          ? headerColVirtualizers[headerColVirtualizers.length - 1]
          : headerColVirtualizers[0],
    },
  };
}
