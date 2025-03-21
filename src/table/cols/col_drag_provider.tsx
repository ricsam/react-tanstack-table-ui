import { ColumnOrderState, Table } from "@tanstack/react-table";
import React from "react";
import { DndColContext, DndProvider } from "../dnd_provider";
import { arrayMove } from "../rows/dnd/array_move";
import { Item, PinPos } from "../rows/dnd/move_in_window";
import { useColDrag } from "./use_col_drag";

export const ColDragProvider = (
  props: {
    columnOrder: ColumnOrderState;
    children: React.ReactNode;
    updateColumnOrder: (newColumnOrder: ColumnOrderState) => void;
    table: Table<any>;
    rowHeight: number;
    width: number;
    tableContainerRef: React.RefObject<HTMLDivElement | null>;
  } & ReturnType<typeof useColDrag>,
) => {
  const {
    table,
    children,
    tableContainerRef,
    vfoot,
    vhead,
    isColDragging,
    setIsColDragging,
  } = props;

  // reorder columns after drag & drop
  function handleColDragEnd(delta: number, pin: false | "left" | "right") {
    if (!isColDragging) {
      throw new Error("No column is being dragged");
    }
    const col = table.getColumn(isColDragging.colId);
    if (!col) {
      throw new Error("No column found");
    }
    setIsColDragging(null);
    const selected = col.getLeafColumns().map((col) => col.id);
    const arrMoveInput = {
      arr: props.columnOrder,
      selected,
      delta,
      getIndex: (id: string) => props.columnOrder.indexOf(id),
    };
    const arrMoveResult = arrayMove(arrMoveInput);
    props.updateColumnOrder(arrMoveResult);
    col.pin(pin);
  }

  const getBodyVirtualCols = () => {
    return vhead.getVirtualHeaders(vhead.headerGroups.length - 1);
  };

  const bodyCols = getBodyVirtualCols().virtualColumns;

  const allCols = table.getAllLeafColumns();

  const averageColSize = React.useMemo(() => {
    return (
      allCols.reduce((acc, col) => {
        return acc + col.getSize();
      }, 0) / allCols.length
    );
  }, [allCols]);

  const selectedCols = React.useMemo(() => {
    let selectedCols: string[] = [];
    if (isColDragging) {
      const col = table.getColumn(isColDragging.colId);
      if (col) {
        selectedCols = col.getLeafColumns().map((col) => col.id);
      }
    }
    return selectedCols;
  }, [isColDragging, table]);

  return (
    <DndProvider
      v2={React.useMemo(
        () => ({
          items: bodyCols.map((vc): Item => {
            const header = vhead.body.headerGroup.headers[vc.index];
            const id = header.id;
            let pinned: PinPos = false;
            const headerPinned = header.column.getIsPinned();
            if (headerPinned === "left") {
              pinned = "start";
            } else if (headerPinned === "right") {
              pinned = "end";
            }
            return {
              id: id,
              index: vc.index,
              pinned,
              start: vc.start,
              size: vc.size,
            };
          }),
          window: {
            numItems: vhead.body.headerGroup.headers.length,
            scroll: 0,
            size: props.width,
            totalSize: table.getTotalSize(),
          },
          selected: selectedCols,
          getGroup(id) {
            const col = table.getColumn(id);
            if (col) {
              return col.getLeafColumns().map((col) => col.id);
            }
            return [id];
          },
        }),
        [
          bodyCols,
          props.width,
          selectedCols,
          table,
          vhead.body.headerGroup.headers,
        ],
      )}
      table={table}
      getPinned={(id) => {
        const col = table.getColumn(id);
        if (!col) {
          throw new Error("No column");
        }
        const pinned = col.getIsPinned();
        if (pinned) {
          return { pinned, pinnedIndex: col.getPinnedIndex() };
        }
        return {
          pinned: false,
        };
      }}
      /* eslint-disable react-hooks/exhaustive-deps */
      cols={React.useMemo(() => {
        return allCols.map((col) => {
          return { id: col.id, size: col.getSize() };
        });
      }, [
        allCols,
        table.getState().columnSizingInfo,
        table.getState().columnSizing,
        props.columnOrder,
      ])}
      getSize={React.useCallback(
        (id: string) => {
          const col = table.getColumn(id);
          if (!col) {
            throw new Error("No column");
          }
          return col.getSize();
        },
        [
          table.getState().columnSizingInfo,
          table.getState().columnSizing,
          props.columnOrder,
        ],
      )}
      getAverageSize={() => averageColSize}
      dimension="x"
      scrollRef={tableContainerRef}
      onDragEnd={(result) => {
        if (result) {
          const { delta, pin } = result;
          handleColDragEnd(
            delta,
            pin === "start" ? "left" : pin === "end" ? "right" : false,
          );
        }
        vhead.updateAllDraggedIndexes(null);
        vfoot.updateAllDraggedIndexes(null);
      }}
      onDragCancel={() => {
        vhead.updateAllDraggedIndexes(null);
        vfoot.updateAllDraggedIndexes(null);
        setIsColDragging(null);
      }}
      onDragStart={(
        colId,
        meta: { type: "header" | "footer"; headerId: string },
      ) => {
        const loop = (
          g: typeof vfoot | typeof vhead,
          type: "header" | "footer",
        ): boolean => {
          const loop = (headerGroupIndex: number) => {
            const headerGroup = g.headerGroups[headerGroupIndex];
            const headerIndex = headerGroup.headers.findIndex(
              (header) => header.id === meta.headerId,
            );
            if (headerIndex !== -1) {
              setIsColDragging({
                colId: headerGroup.headers[headerIndex].column.id,
                headerGroupIndex,
                type,
                headerId: meta.headerId,
              });
              g.updateDraggedIndex(headerGroupIndex, headerIndex);
              return true;
            }
          };
          for (
            let headerGroupIndex = 0;
            headerGroupIndex < g.headerGroups.length;
            headerGroupIndex++
          ) {
            if (loop(headerGroupIndex)) {
              return true;
            }
          }

          return false;
        };

        // check if it's a header or footer
        const result =
          meta.type === "footer"
            ? loop(vfoot, "footer")
            : loop(vhead, "header");

        if (!result) {
          console.log({ vhead, vfoot, colId: colId });
          throw new Error("No column found");
        }
      }}
      DndContext={DndColContext}
    >
      {children}
    </DndProvider>
  );
};
