import { ColumnOrderState, Table } from "@tanstack/react-table";
import React from "react";
import { Item, PinPos } from "../move";
import {
  defaultRangeExtractor,
  measureElement,
  Range,
  useVirtualizer,
  Virtualizer,
} from "../react-virtual";
import { arrayMove, groupedArrayMove } from "./array_move";
import {
  DndActive,
  DndColContext,
  DndProvider,
  DndRowContext,
  V2,
} from "./dnd_provider";
import { renderHeaderGroup } from "./render_header_group";
import { TableBody } from "./table_body";
import { useHeaderGroupVirtualizers } from "./use_header_group_virtualizers";
import { RowContext } from "./row_context";

export const VirtualizedTable = <T,>(props: {
  data: T[];
  updateData: (newData: T[]) => void;
  columnOrder: ColumnOrderState;
  updateColumnOrder: (newColumnOrder: ColumnOrderState) => void;
  table: Table<T>;
  getSubRows: (row: T) => T[];
  updateSubRows: (row: T, newSubRows: T[]) => T;
  getId: (row: T) => string;
  getGroup: (row: T) => string | undefined;
  rootGroup: string;
  rowHeight: number;
  width: number;
  height: number;
}) => {
  const { table } = props;

  const [isDragging, setIsDragging] = React.useState<{
    colId: string;
    headerId: string;
    headerGroupIndex: number;
    type: "header" | "footer";
  } | null>(null);

  const { rows } = table.getRowModel();
  const rowIds = React.useMemo(() => {
    return rows.map((row) => row.id);
  }, [rows]);

  // reorder columns after drag & drop
  function handleColDragEnd(delta: number, pin: false | "left" | "right") {
    if (!isDragging) {
      throw new Error("No column is being dragged");
    }
    const col = table.getColumn(isDragging.colId);
    if (!col) {
      throw new Error("No column found");
    }
    setIsDragging(null);
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

  const [draggedRowId, setDraggedRowId] = React.useState<string | null>(null);

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
      getExpanded: (row: T) => {
        const id = props.getId(row);
        const tableRow = table.getRow(id);
        if (!tableRow) {
          return false;
        }
        return tableRow.getIsExpanded();
      },
    };

    // console.log(arrayMoveProps);

    // return;

    const after = groupedArrayMove(arrayMoveProps);

    props.updateData(after);

    selected.forEach((id) => {
      table.getRow(id)?.pin(pin);
    });
  }

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

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

  const virtualRows = rowVirtualizer.getVirtualItems();

  const vhead = useHeaderGroupVirtualizers({
    headerGroups: table.getHeaderGroups(),
    tableContainerRef,
    table,
    type: "header",
    rowHeight: props.rowHeight,
  });
  const vfoot = useHeaderGroupVirtualizers({
    headerGroups: table.getFooterGroups(),
    tableContainerRef,
    table,
    type: "footer",
    rowHeight: props.rowHeight,
  });

  const getBodyVirtualCols = () => {
    return vhead.getVirtualHeaders(vhead.headerGroups.length - 1);
  };

  const bodyCols = getBodyVirtualCols().virtualColumns;

  const [activeDrag, setActiveDrag] = React.useState<"row" | "col">("col");

  const allCols = table.getAllLeafColumns();

  const averageColSize = React.useMemo(() => {
    return (
      allCols.reduce((acc, col) => {
        return acc + col.getSize();
      }, 0) / allCols.length
    );
  }, [allCols]);

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

  const selectedCols = React.useMemo(() => {
    let selectedCols: string[] = [];
    if (isDragging) {
      const header = table.getFlatHeaders().find((header) => {
        return header.id === isDragging.headerId;
      });
      if (header) {
        // const col = table.getColumn(isDragging.colId);
        if (header.subHeaders.length > 0) {
          selectedCols = header.subHeaders.map((header) => header.column.id);
          console.log("@selectedCols", selectedCols);
        } else {
          selectedCols = [header.column.id];
        }
      }
    }
    return selectedCols;
  }, [isDragging, table]);

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
        getVirtualItemForOffset={(offset) => {
          return vhead.body.virtualizer.getVirtualItemForOffset(offset);
        }}
        getRenderedRange={React.useCallback(
          () =>
            bodyCols.map((vc) => vhead.body.headerGroup.headers[vc.index].id),
          [bodyCols, vhead.body.headerGroup],
        )}
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
          setIsDragging(null);
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
                setIsDragging({
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
          getVirtualItemForOffset={(offset) => {
            return rowVirtualizer.getVirtualItemForOffset(offset);
          }}
          getRenderedRange={React.useCallback(
            () => virtualRows.map((vc) => rows[vc.index].id),
            [rows, virtualRows],
          )}
          selected={React.useMemo(() => {
            return {
              state: table.getState().rowSelection,
            };
          }, [table.getSelectedRowModel()])}
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
          <div
            ref={tableContainerRef}
            style={{
              overflow: "auto",
              width: props.width + "px",
              height: props.height + "px",
              position: "relative",
              contain: "paint",
              willChange: "transform",
            }}
          >
            <div
              className="table-scroller"
              style={{
                width: table.getTotalSize(),
                height:
                  rowVirtualizer.getTotalSize() + vhead.height + vfoot.height,
                position: "absolute",
              }}
            ></div>

            <div
              className="thead"
              style={{
                position: "sticky",
                top: 0,
                background: "black",
                width: table.getTotalSize(),
                zIndex: 1,
              }}
            >
              {vhead.headerGroups.map((headerGroup, headerGroupIndex, arr) => {
                const { virtualColumns, virtualizer } =
                  vhead.getVirtualHeaders(headerGroupIndex);

                // if we are splitting the header group, we need to disable the parent headers, i.e. not render them
                const hidden =
                  isDragging &&
                  (isDragging.headerGroupIndex > headerGroupIndex ||
                    isDragging.type !== "header")
                    ? true
                    : false;

                // headerGroup.id ===

                return renderHeaderGroup({
                  headerGroup,
                  virtualColumns,
                  virtualizer,
                  hidden,
                  table,
                  defToRender: "header",
                  rowHeight: props.rowHeight,
                  draggedColId:
                    isDragging && headerGroupIndex !== arr.length - 1
                      ? isDragging.colId
                      : null,
                });
              })}
            </div>

            <TableBody
              virtualColumns={bodyCols}
              virtualRows={virtualRows}
              rows={rows}
              measureElement={rowVirtualizer.measureElement}
              width={table.getTotalSize()}
              totalWidth={table.getTotalSize()}
              totalHeight={rowVirtualizer.getTotalSize()}
              rowHeight={props.rowHeight}
              rowIds={rowIds}
            ></TableBody>

            <div
              className="table-footer"
              style={{
                position: "sticky",
                bottom: 0,
                background: "black",
                width: table.getTotalSize(),
                zIndex: 1,
              }}
            >
              {vfoot.headerGroups.map((footerGroup, footerIndex, arr) => {
                const { virtualColumns, virtualizer } =
                  vfoot.getVirtualHeaders(footerIndex);

                // if we are splitting the header group, we need to disable the parent headers, i.e. not render them
                const hidden =
                  isDragging &&
                  (isDragging.headerGroupIndex < footerIndex ||
                    isDragging.type !== "footer")
                    ? true
                    : false;

                return renderHeaderGroup({
                  headerGroup: footerGroup,
                  virtualColumns,
                  virtualizer,
                  hidden,
                  table,
                  defToRender: "footer",
                  rowHeight: props.rowHeight,
                  draggedColId:
                    isDragging && footerIndex !== 0 ? isDragging.colId : null,
                });
              })}
            </div>
          </div>
        </DndProvider>
      </DndProvider>
    </RowContext.Provider>
  );
};
