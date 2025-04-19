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
import { getIsPinned, mapColumnPinningPositionToPinPos, shallowEqual } from "../../utils";
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

export type FilteredHeaderGroup = {
  filteredHeaderGroups: CombinedHeaderGroup[];
  headerIndices: Record<string, undefined | HeaderIndex[]>;
  headerGroupIndices: Record<
    string,
    { groupIndex: number; headerIndices: Record<string, number> }
  >;
};

export function useHeaderGroupVirtualizers(props: {
  headerGroupsRef: React.RefObject<FilteredHeaderGroup>;
  type: "footer" | "header";
  rerender: () => void;
}): () => VirtualHeaderGroup[] {
  const { tableContainerRef } = useTableContext();

  const getters = {
    getHeaderGroupIndices: () =>
      props.headerGroupsRef.current.headerGroupIndices,
    getFilteredHeaderGroups: () =>
      props.headerGroupsRef.current.filteredHeaderGroups,
    getHeaderIndices: () => props.headerGroupsRef.current.headerIndices,
  };
  const gettersRef = React.useRef(getters);
  gettersRef.current = getters;

  const { columnOverscan } = useTableProps({
    callback: (props) => {
      return {
        columnOverscan: props.uiProps.columnOverscan,
      };
    },
    dependencies: [{ type: "ui_props" }],
    areCallbackOutputEqual: shallowEqual,
  });

  const baseColVirtOpts = (
    groupId: string,
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
      overscan: columnOverscan, //how many columns to render on each side off screen each way (adjust this for performance)
      rangeExtractor: (range) => {
        const { getHeaderGroupIndices, getFilteredHeaderGroups } =
          gettersRef.current;
        const { groupIndex } = getHeaderGroupIndices()[groupId];
        const headerGroup = getFilteredHeaderGroups()[groupIndex];
        const headersInstance = headerGroup._slow_headers;
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
        const { getHeaderGroupIndices, getFilteredHeaderGroups } =
          gettersRef.current;
        const { groupIndex } = getHeaderGroupIndices()[groupId];
        const headerGroup = getFilteredHeaderGroups()[groupIndex];
        const headersInstance = headerGroup._slow_headers;
        return headersInstance[index].id;
      },
    };
  };

  const headerColVirtualizerOptions: Record<
    string,
    () => VirtualizerOptions<HTMLDivElement, Element>
  > = {};
  props.headerGroupsRef.current.filteredHeaderGroups.forEach((headerGroup) => {
    headerColVirtualizerOptions[headerGroup.id] = () => ({
      // todo, don't call here, instead call when headerColVirterOptions is used
      ...baseColVirtOpts(headerGroup.id),
      count: headerGroup._slow_headers.length,
      estimateSize: (index) => headerGroup._slow_headers[index].getSize(),
      observeElementRect,
      observeElementOffset,
      scrollToFn: () => {},
      onChange: (_, sync) => {
        if (sync) {
          flushSync(props.rerender);
        } else {
          props.rerender();
        }
      },
    });
  });

  const headerColVirtualizersCache = React.useRef<
    Record<string, Virtualizer<any, any>>
  >({});
  const headerColVirtualizers = React.useRef<
    Record<string, Virtualizer<any, any>>
  >({});

  if (
    Object.keys(headerColVirtualizerOptions).length >
    Object.keys(headerColVirtualizersCache.current).length
  ) {
    const prevVirtualizer: Virtualizer<any, any> | undefined =
      headerColVirtualizers.current[
        Object.keys(headerColVirtualizers.current)[0]
      ];
    for (
      let i = Object.keys(headerColVirtualizers.current).length;
      i < Object.keys(headerColVirtualizerOptions).length;
      i++
    ) {
      const id = props.headerGroupsRef.current.filteredHeaderGroups[i].id;
      const newVirtualizer = new Virtualizer({
        ...headerColVirtualizerOptions[id](),
        initialOffset: prevVirtualizer?.scrollOffset ?? undefined,
      });
      headerColVirtualizersCache.current[id] = newVirtualizer;
    }
  }

  headerColVirtualizers.current = {};
  for (let i = 0; i < Object.keys(headerColVirtualizerOptions).length; i++) {
    const id = props.headerGroupsRef.current.filteredHeaderGroups[i].id;
    headerColVirtualizers.current[id] = headerColVirtualizersCache.current[id];
  }

  const { columnSizingInfo, columnSizing } = useTableProps({
    callback: (table) => {
      const { columnSizingInfo, columnSizing } = table.tanstackTable.getState();
      return { columnSizingInfo, columnSizing };
    },
  });

  useIsomorphicLayoutEffect(() => {
    if (columnSizingInfo.isResizingColumn) {
      const indices =
        gettersRef.current.getHeaderIndices()[
          columnSizingInfo.isResizingColumn
        ];
      if (!indices) {
        return;
      }
      indices.forEach(({ headerIndex, header, groupId }) => {
        const virtualizer = headerColVirtualizers.current[groupId];
        const headerSize = header.getSize();

        virtualizer.resizeItem(headerIndex, headerSize);
      });
    }
  }, [columnSizingInfo.isResizingColumn, columnSizing]);

  Object.entries(headerColVirtualizers.current).forEach(([groupId, cv]) => {
    cv.shouldAdjustScrollPositionOnItemSizeChange = undefined;
    cv.setOptions({
      ...headerColVirtualizerOptions[groupId](),
      initialOffset: cv.options.initialOffset,
    });
    cv.calculateRange();
  });

  useIsomorphicLayoutEffect(() => {
    const cleanups = Object.values(headerColVirtualizers.current).map((cv) => {
      return cv._didMount();
    });
    return () => {
      cleanups.forEach((cleanup) => {
        cleanup();
      });
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    Object.values(headerColVirtualizers.current).forEach((cv) => {
      cv._willUpdate();
    });
  });

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
      const updateGroupCache = (groupId: string, data: GroupCache) => {
        const { getHeaderGroupIndices } = gettersRef.current;
        const { groupIndex } = getHeaderGroupIndices()[groupId];
        if (!groupCache.current[groupIndex]) {
          groupCache.current[groupIndex] = {};
        }
        Object.assign(groupCache.current[groupIndex], data);
      };
      const getGroupCache = <T extends keyof GroupCache>(
        groupId: string,
        key: T,
      ) => {
        const { getHeaderGroupIndices } = gettersRef.current;
        const { groupIndex } = getHeaderGroupIndices()[groupId];
        return groupCache.current[groupIndex]?.[key];
      };
      const updateStateCache = (id: string, data: VirtualHeaderCellState) => {
        stateCache.current[id] = data;
      };
      const getStateCache = (
        id: string,
      ): VirtualHeaderCellState | undefined => {
        return stateCache.current[id];
      };
      const virtualHeaderGroups =
        props.headerGroupsRef.current.filteredHeaderGroups.map(
          ({ id: groupId }): VirtualHeaderGroup => {
            const getVirtualHeader = (
              headerFn: () => Header<any, unknown>,
              getIndex: () => number,
            ): VirtualHeaderCell => {
              const getState = () => {
                const header = headerFn();
                const headerId = header.id;
                const { getHeaderGroupIndices } = gettersRef.current;
                const { groupIndex, headerIndices } =
                  getHeaderGroupIndices()[groupId];
                const headerIndex = headerIndices[headerId];
                const cacheEntry = getStateCache(headerId);
                if (cacheEntry) {
                  return cacheEntry;
                }
                const isPinned = getIsPinned(header);
                const headerGroup =
                  props.headerGroupsRef.current.filteredHeaderGroups[
                    groupIndex
                  ];

                const width = header.getSize();
                const allHeaders = headerGroup._slow_headers;

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

              const fixedHeader = headerFn();
              if (writeToCache) {
                updateStateCache(fixedHeader.id, getState());
              }

              return {
                header: headerFn,
                id: fixedHeader.id,
                columnId: fixedHeader.column.id,
                type: props.type,
                getState,
                getIndex,
              };
            };

            const getHeaders = () => {
              const cacheEntry = getGroupCache(groupId, "headers");
              if (cacheEntry) {
                return cacheEntry;
              }

              const { getHeaderGroupIndices } = gettersRef.current;
              const { groupIndex } = getHeaderGroupIndices()[groupId];
              const virtualizer = headerColVirtualizers.current[groupId];
              const headerGroup =
                props.headerGroupsRef.current.filteredHeaderGroups[groupIndex];
              const headers = virtualizer.getVirtualItems().map((vc) => {
                return getVirtualHeader(
                  () => {
                    return headerGroup._slow_headers[vc.index];
                  },
                  () => vc.index,
                );
              });
              updateGroupCache(groupId, { headers });
              return headers;
            };

            const getOffsets = (): HorOffsets => {
              const virtualizer = headerColVirtualizers.current[groupId];
              const totalSize = virtualizer.getTotalSize();

              const cacheEntry = getGroupCache(groupId, "offsets");
              if (cacheEntry) {
                return cacheEntry;
              }

              const offsets = getColVirtualizedOffsets({
                headers: getHeaders(),
                totalSize,
              });
              updateGroupCache(groupId, { offsets });
              return offsets;
            };
            if (writeToCache) {
              updateGroupCache(groupId, {
                headers: getHeaders(),
                offsets: getOffsets(),
              });
            }

            return {
              getVirtualizer: () => {
                return headerColVirtualizers.current[groupId];
              },
              id: groupId,
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
  const virtualHeaderGroups = getVirtualHeaderGroups();

  useTriggerTablePropsUpdate(
    virtualHeaderGroups.map((vgroup) => {
      return {
        dependency: {
          type: "col_visible_range",
          groupType: vgroup.type,
          groupId: vgroup.id,
        },
        cacheKey: vgroup
          .getHeaders()
          .map((vi) => vi.id)
          .join(","),
      };
    }),
  );

  return getVirtualHeaderGroups;
}
