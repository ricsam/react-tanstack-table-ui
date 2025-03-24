/* eslint-disable react-hooks/exhaustive-deps */
import { Table } from "@tanstack/react-table";
import React from "react";
import { DndProvider, DndRowContext, V2 } from "../dnd_provider";
import { groupedArrayMove } from "./dnd/array_move";
import { Item, PinPos } from "./dnd/move_in_window";
import { RowContext } from "./row_context";
import {
  defaultRangeExtractor,
  measureElement,
  useVirtualizer,
  Virtualizer,
  Range,
} from "../../lib/react-virtual";

export const RowDragProvider = (props: {
  children: React.ReactNode;
  data: any[];
  updateData: (newData: any[]) => void;
  table: Table<any>;
  getSubRows: (row: any) => any[];
  updateSubRows: (row: any, newSubRows: any[]) => any;
  getId: (row: any) => string;
  getGroup: (row: any) => string | undefined;
  rootGroup: string;
  rowHeight: number;
  height: number;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const { children, table, tableContainerRef } = props;
  const [draggedRowId, setDraggedRowId] = React.useState<string | null>(null);

  const { rows } = table.getRowModel();
  const rowIds = React.useMemo(() => {
    return rows.map((row) => row.id);
  }, [rows]);

  const _refs = { table, rowIds };
  const refs = React.useRef(_refs);
  refs.current = _refs;

  const defaultRowWindowRef = React.useRef<number[] | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: React.useCallback(() => props.rowHeight, [props.rowHeight]),
    getItemKey: React.useCallback((index: number) => rowIds[index], [rowIds]),
    getScrollElement: () => tableContainerRef.current,
    measureElement: React.useCallback(
      (
        element: any,
        entry: ResizeObserverEntry | undefined,
        instance: Virtualizer<HTMLDivElement, any>,
      ) => {
        const defaultSize = measureElement(element, entry, instance);
        return Math.max(defaultSize, props.rowHeight);
      },
      [props.rowHeight],
    ),
    overscan: 5,
    rangeExtractor: React.useCallback(
      (range: Range, instance: Virtualizer<HTMLDivElement, any>): number[] => {
        const table = refs.current.table;

        // Extract the default visible range using the default range extractor
        const defaultRange = defaultRangeExtractor(range);
        const defaultRangeSet = new Set(defaultRange); // Track the default range as a set for easy addition
        const next = new Set(defaultRange); // Initialize the new virtualized range starting with the default range
        let draggedHeight = 0; // Total height of the dragged rows

        if (draggedRowId !== null) {
          // If there is a dragged row, retrieve it
          const draggedIndex = refs.current.rowIds.indexOf(draggedRowId);

          // Add the dragged row index to the virtualized range
          next.add(draggedIndex);

          // Check if the dragged row is part of the current selection
          if (table.getState().rowSelection[draggedRowId]) {
            // If selected, include all selected rows in the virtualized range
            // @slow
            table.getSelectedRowModel().rows.forEach((r) => {
              next.add(r.index); // Add selected row indices
              draggedHeight +=
                instance.measurementsCache[r.index].size ?? props.rowHeight; // Accumulate their heights
            });
          } else {
            // If not selected, only consider the dragged row's height
            draggedHeight +=
              instance.measurementsCache[draggedIndex].size ?? props.rowHeight;
          }
        }

        // Calculate the number of additional rows needed to cover the screen
        const rowsToAdd = Math.floor(draggedHeight / props.rowHeight);
        if (rowsToAdd > 0) {
          const firstIndex = defaultRange[0]; // First index in the default visible range
          const lastIndex = defaultRange[defaultRange.length - 1]; // Last index in the default visible range

          // Split the additional rows roughly evenly between the head and tail
          let tailPush = Math.floor(rowsToAdd / 2);
          const headPush = Math.floor(rowsToAdd / 2);

          // Add rows before the first visible row (expanding upward)
          for (let i = 0; i < headPush; i += 1) {
            const newIndex = firstIndex - i;
            if (newIndex < 0) {
              // If we go beyond the first row, shift the remaining rows to the tail
              tailPush += headPush - i;
              break;
            }
            next.add(newIndex);
            defaultRangeSet.add(newIndex);
          }

          // Add rows after the last visible row (expanding downward)
          for (let i = 0; i < tailPush; i += 1) {
            const newIndex = lastIndex + i;
            if (newIndex >= rows.length) {
              // Stop if we exceed the number of available rows
              break;
            }
            next.add(newIndex);
            defaultRangeSet.add(newIndex);
          }
        }

        // Store the expanded range for reference
        defaultRowWindowRef.current = [...defaultRangeSet].sort(
          (a, b) => a - b,
        );

        // Return the final range, sorted for consistent rendering
        const n = [...next].sort((a, b) => a - b);
        return n;
      },
      [draggedRowId, props.rowHeight, rows.length],
    ),
  });

  function handleRowDragEnd(delta: number, pin: false | "top" | "bottom") {
    if (!draggedRowId) {
      return;
    }

    let selected = table.getSelectedRowModel().rows.map((row) => row.id);

    if (!selected.includes(draggedRowId)) {
      selected = [draggedRowId];
    }

    const arrayMoveProps = {
      originalData: props.data,
      flatSelected: selected,
      delta,
      getSubRows: props.getSubRows,
      getGroup: props.getGroup,
      getId: props.getId,
      updateSubRows: props.updateSubRows,
      rootGroup: props.rootGroup,
      getExpanded: (row: any) => {
        const id = props.getId(row);
        const tableRow = table.getRow(id);
        if (!tableRow) {
          return false;
        }
        return tableRow.getIsExpanded();
      },
    };

    const after = groupedArrayMove(arrayMoveProps);

    props.updateData(after);

    selected.forEach((id) => {
      table.getRow(id)?.pin(pin);
    });
  }

  const virtualRows = rowVirtualizer.getVirtualItems();

  const virtualRowsForTable = React.useMemo(() => {
    // items: Item[];
    return virtualRows.map((vc): Item => {
      const row = rows[vc.index];
      const id = row.id;
      let pinned: PinPos = false;
      const rowPinned = row.getIsPinned();
      if (rowPinned === "top") {
        pinned = "start";
      } else if (rowPinned === "bottom") {
        pinned = "end";
      }
      return {
        id: id,
        index: vc.index,
        pinned,
        start: vc.start,
        size: vc.size,
      };
    });
  }, [rows, virtualRows]);

  const selectedRows = React.useMemo(() => {
    let selectedRows: string[] = [];
    const virtualRowMap: Record<string, Item> = {};
    virtualRowsForTable.forEach((item) => {
      virtualRowMap[item.id] = item;
    });
    if (draggedRowId) {
      const allSelectedRows = table
        .getSelectedRowModel()
        .flatRows.map((r) => r.id);
      if (allSelectedRows.includes(draggedRowId)) {
        selectedRows = allSelectedRows;
      } else {
        selectedRows = [draggedRowId];
      }
      // add the child rows to the selected
      const getSubRows = (id: string): string[] => {
        const row = table.getRow(id);
        if (row.getIsExpanded()) {
          return [id, ...row.subRows.flatMap((row) => getSubRows(row.id))];
        }
        return [id];
      };
      selectedRows = selectedRows.flatMap(getSubRows);
    }
    return selectedRows.filter((id) => Boolean(virtualRowMap[id]));
  }, [draggedRowId, table, virtualRowsForTable]);

  const rowV2: V2 = React.useMemo(
    () => ({
      items: virtualRowsForTable,
      window: {
        numItems: rows.length,
        scroll: 0,
        size: props.height,
        totalSize: rowVirtualizer.getTotalSize(),
      },
      selected: selectedRows,
      getGroup(id) {
        // we can't make a group move with rows, a row has children. But we can have header groups
        return [id];
      },
    }),
    [
      props.height,
      rowVirtualizer,
      rows.length,
      selectedRows,
      virtualRowsForTable,
    ],
  );

  return (
    <RowContext.Provider
      value={{
        getStart: React.useCallback(
          (id) => {
            const row = table.getRow(id);
            if (!row) {
              throw new Error("No row");
            }

            const estimateStart = (index: number) => {
              console.log(
                "@rowVirtualizer.measurementsCache",
                rowVirtualizer.measurementsCache,
              );
              return 0;
            };
            // console.log(rowVirtualizer.measurementsCache);
            const flatIndex = rowIds.indexOf(row.id);
            return (
              rowVirtualizer.measurementsCache[flatIndex].start ??
              estimateStart(flatIndex)
            );
          },
          [rowIds, rowVirtualizer.measurementsCache, table],
        ),
      }}
    >
      <DndProvider
        table={table}
        v2={rowV2}
        getPinned={(id) => {
          const row = table.getRow(id);
          if (!row) {
            throw new Error("No row");
          }
          const pin = row.getIsPinned();
          if (pin === "bottom") {
            return { pinned: "right", pinnedIndex: row.getPinnedIndex() };
          }
          if (pin === "top") {
            return { pinned: "left", pinnedIndex: row.getPinnedIndex() };
          }
          return { pinned: false };
        }}
        dimension="y"
        selected={React.useMemo(() => {
          return {
            state: table.getState().rowSelection,
          };
        }, [table, table.getSelectedRowModel()])}
        getSize={React.useCallback(
          (id) => {
            const flatIndex = rowIds.indexOf(id);
            const size = rowVirtualizer.measurementsCache[flatIndex].size;
            return size ?? props.rowHeight;
          },
          [rowVirtualizer.measurementsCache, table],
        )}
        getAverageSize={() => props.rowHeight}
        DndContext={DndRowContext}
        scrollRef={tableContainerRef}
        onDragEnd={(result) => {
          if (result) {
            const { delta, pin } = result;
            handleRowDragEnd(
              delta,
              pin === "start" ? "top" : pin === "end" ? "bottom" : false,
            );
          }
          setDraggedRowId(null);
        }}
        onDragCancel={() => {
          setDraggedRowId(null);
        }}
        onDragStart={(rowId) => {
          setDraggedRowId(rowId);
        }}
        cols={rowIds.map((id) => {
          return { id, size: props.rowHeight };
        })}
        /* eslint-enable react-hooks/exhaustive-deps */
      >
        {children}
      </DndProvider>
    </RowContext.Provider>
  );
};
