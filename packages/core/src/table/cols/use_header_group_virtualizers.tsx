import { Header } from "@tanstack/react-table";
import {
  defaultRangeExtractor,
  observeElementOffset,
  observeElementRect,
  Virtualizer,
  VirtualizerOptions,
} from "@tanstack/react-virtual";
import React from "react";
import { flushSync } from "react-dom";
import { getIsPinned, mapColumnPinningPositionToPinPos } from "../../utils";
import { useTableProps } from "../hooks/use_table_props";
import { useTableContext } from "../table_context";
import {
  CombinedHeaderGroup,
  VirtualHeaderCell,
  VirtualHeaderCellState,
  VirtualHeaderGroup,
} from "../types";
import { getColVirtualizedOffsets } from "./get_col_virtualized_offset";
import { HeaderIndex } from "./virtual_header/types";
import { useTriggerTablePropsUpdate } from "../hooks/use_trigger_table_props_update";
import { HorOffsets } from "./col_virtualizer_type";

const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;

type FilteredHeaderGroup = {
  filteredHeaderGroups: CombinedHeaderGroup[];
  headerIndices: Record<string, undefined | HeaderIndex[]>;
};

export function useHeaderGroupVirtualizers(props: {
  headerGroupsRef: React.RefObject<FilteredHeaderGroup>;
  type: "footer" | "header";
}): () => VirtualHeaderGroup[] {
  const { tableContainerRef, config } = useTableContext();

  const baseColVirtOpts = (
    headerGroupIndex: number,
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
        const headerGroup =
          props.headerGroupsRef.current.filteredHeaderGroups[headerGroupIndex];
        const headersInstance = headerGroup.headers;
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
        const headerGroup =
          props.headerGroupsRef.current.filteredHeaderGroups[headerGroupIndex];
        const headersInstance = headerGroup.headers;
        return headersInstance[index].id;
      },
    };
  };

  const rerender = React.useReducer(() => ({}), {})[1];

  const headerColVirtualizerOptions =
    props.headerGroupsRef.current.filteredHeaderGroups.map(
      (
        headerGroup,
        headerGroupIndex,
      ): (() => VirtualizerOptions<HTMLDivElement, Element>) => {
        return () => ({
          // todo, don't call here, instead call when headerColVirterOptions is used
          ...baseColVirtOpts(headerGroupIndex),
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
        });
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
        ...headerColVirtualizerOptions[i](),
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
      const indices =
        props.headerGroupsRef.current.headerIndices[
          columnSizingInfo.isResizingColumn
        ];
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
    props.headerGroupsRef.current.headerIndices,
    columnSizing,
  ]);

  headerColVirtualizers.current.forEach((cv, i) => {
    cv.shouldAdjustScrollPositionOnItemSizeChange = undefined;
    cv.setOptions({
      ...headerColVirtualizerOptions[i](),
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

  useTriggerTablePropsUpdate(
    `col_visible_range_${props.type}`,
    headerColVirtualizers.current
      .map((cv) =>
        cv
          .getVirtualItems()
          .map((vi) => vi.index)
          .join(","),
      )
      .join("|"),
  );

  type GroupCache = {
    headers?: VirtualHeaderCell[];
    offsets?: HorOffsets;
  };
  const groupCache = React.useRef<(GroupCache | undefined)[]>([]);

  const stateCache = React.useRef<
    Record<string, VirtualHeaderCellState | undefined>
  >({});

  // never updates usually
  const getVirtualHeaderGroups = React.useCallback(
    (
      /**
       * If true we can write things dependant on the header groups only to cache
       */
      writeToCache?: boolean,
    ) => {
      const updateGroupCache = (i: number, data: GroupCache) => {
        if (!groupCache.current[i]) {
          groupCache.current[i] = {};
        }
        Object.assign(groupCache.current[i], data);
      };
      const getGroupCache = <T extends keyof GroupCache>(i: number, key: T) => {
        return groupCache.current[i]?.[key];
      };
      const updateStateCache = (id: string, data: VirtualHeaderCellState) => {
        stateCache.current[id] = data;
      };
      const getStateCache = (id: string): VirtualHeaderCellState | undefined => {
        return stateCache.current[id];
      };
      const virtualHeaderGroups =
        props.headerGroupsRef.current.filteredHeaderGroups.map(
          (_, i): VirtualHeaderGroup => {
            const getVirtualHeader = (
              headerFn: () => Header<any, unknown>,
              headerIndex: number,
              start: number,
            ): VirtualHeaderCell => {
              const fixedHeader = headerFn();

              const getState = () => {
                const header = headerFn();
                const cacheEntry = getStateCache(header.id);
                if (cacheEntry) {
                  return cacheEntry;
                }
                const isPinned = getIsPinned(header);
                const headerGroup =
                  props.headerGroupsRef.current.filteredHeaderGroups[i];

                const width = header.getSize();
                const allHeaders = headerGroup.headers;

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
                const state: VirtualHeaderCellState = {
                  isPinned: mapColumnPinningPositionToPinPos(isPinned),
                  width,
                  start,
                  end: start + width,
                  isLastPinned,
                  isFirstPinned,
                  isLast,
                  isFirst,
                  isFirstCenter,
                  isLastCenter,
                };
                updateStateCache(header.id, state);
                return state;
              };

              if (writeToCache) {
                updateStateCache(fixedHeader.id, getState());
              }

              return {
                header: headerFn,
                id: fixedHeader.id,
                columnId: fixedHeader.column.id,
                headerIndex,
                type: props.type,
                getState,
              };
            };

            const getHeaders = () => {
              const cacheEntry = getGroupCache(i, "headers");
              if (cacheEntry) {
                return cacheEntry;
              }

              const virtualizer = headerColVirtualizers.current[i];
              const headerGroup =
                props.headerGroupsRef.current.filteredHeaderGroups[i];
              const headers = virtualizer.getVirtualItems().map((vc) => {
                return getVirtualHeader(
                  () => {
                    return headerGroup.headers[vc.index];
                  },
                  vc.index,
                  vc.start,
                );
              });
              updateGroupCache(i, { headers });
              return headers;
            };

            const getOffsets = (): HorOffsets => {
              const virtualizer = headerColVirtualizers.current[i];
              const totalSize = virtualizer.getTotalSize();

              const cacheEntry = getGroupCache(i, "offsets");
              if (cacheEntry) {
                return cacheEntry;
              }

              const offsets = getColVirtualizedOffsets({
                headers: getHeaders(),
                totalSize,
              });
              updateGroupCache(i, { offsets });
              return offsets;
            };
            if (writeToCache) {
              updateGroupCache(i, {
                headers: getHeaders(),
                offsets: getOffsets(),
              });
            }

            const headerGroup =
              props.headerGroupsRef.current.filteredHeaderGroups[i];
            return {
              getVirtualizer: () => headerColVirtualizers.current[i],
              id: headerGroup.id,
              type: props.type,
              getHeaders,
              getOffsets,
            };
          },
        );

      return virtualHeaderGroups;
    },
    [props],
  );

  groupCache.current = [];
  stateCache.current = {};
  getVirtualHeaderGroups(true);

  return getVirtualHeaderGroups;
}
