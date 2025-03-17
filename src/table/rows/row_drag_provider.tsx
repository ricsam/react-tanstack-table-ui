/* eslint-disable react-hooks/exhaustive-deps */
import { Table } from "@tanstack/react-table";
import React from "react";
import { DndProvider, DndRowContext, V2 } from "../dnd_provider";
import { groupedArrayMove } from "./dnd/array_move";
import { Item, PinPos } from "./dnd/move_in_window";
import { RowContext } from "./row_context";
import { useRowDrag } from "./use_row_drag";

export const RowDragProvider = (
  props: {
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
  } & ReturnType<typeof useRowDrag>,
) => {
  const {
    table,
    children,
    tableContainerRef,
    rowVirtualizer,
    draggedRowId,
    setDraggedRowId,
    rows,
    rowIds,
  } = props;

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

  const _refs = { table, rowIds };
  const refs = React.useRef(_refs);
  refs.current = _refs;

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
        getRenderedRange={React.useCallback(
          () => virtualRows.map((vc) => rows[vc.index].id),
          [rows, virtualRows],
        )}
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
