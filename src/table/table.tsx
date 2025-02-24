import {
  ColumnOrderState,
  Header,
  HeaderGroup,
  Row,
  Table,
} from "@tanstack/react-table";
import React from "react";
import { flushSync } from "react-dom";
import { PinPos, Item } from "../move";
import {
  defaultRangeExtractor,
  elementScroll,
  measureElement,
  observeElementOffset,
  observeElementRect,
  Range,
  useVirtualizer,
  VirtualItem,
  Virtualizer,
  VirtualizerOptions,
} from "../react-virtual";
import { arrayMove, groupedArrayMove } from "./array_move";
import {
  DndActive,
  DndColContext,
  DndProvider,
  DndRowContext,
} from "./dnd_provider";
import {
  calculateDisplacements as calculateDisplacement2,
  findDeltaAtPosition,
} from "../Item";
import { renderHeaderGroup } from "./render_header_group";
import { getFlatIndex } from "./utils";
import { TableBody } from "./table_body";
import { useHeaderGroupVirtualizers } from "./use_header_group_virtualizers";

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

  const [isDragging, setIsDragging] = React.useState<string | null>(null);

  const { rows } = table.getRowModel();
  const rowIds = React.useMemo(() => {
    return rows.map((row) => row.id);
  }, [rows]);

  // reorder columns after drag & drop
  function handleColDragEnd(delta: number, pin: false | "left" | "right") {
    if (!isDragging) {
      throw new Error("No column is being dragged");
    }
    const col = table.getColumn(isDragging);
    if (!col) {
      throw new Error("No column found");
    }
    setIsDragging(null);
    const selected = col.getFlatColumns().map((col) => col.id);
    props.updateColumnOrder(
      arrayMove({
        arr: props.columnOrder,
        selected,
        delta,
        getIndex: (id) => props.columnOrder.indexOf(id),
      }),
    );
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

    // const withSubRows = (id: string): string[] => {
    //   const row = table.getRow(id);
    //   if (!row) {
    //     return [];
    //   }
    //   return [id, ...row.subRows.flatMap((r) => [r.id, ...withSubRows(r.id)])];
    // };

    // selected = selected.flatMap(withSubRows);

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
          const draggedRow = table.getRow(draggedRowId);
          const draggedIndex = getFlatIndex(draggedRow);

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

  return (
    <DndProvider
      v2={{
        items: bodyCols.map((vc) => {
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
        selected: [],
      }}
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
        () => bodyCols.map((vc) => vhead.body.headerGroup.headers[vc.index].id),
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
      getStart={React.useCallback(
        (id: string) => {
          const col = table.getColumn(id);
          if (!col) {
            throw new Error("No column");
          }
          return bodyCols.find((vc) => vc.index === col.getIndex())?.start ?? 0;
        },
        [
          bodyCols,
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
      }}
      onDragCancel={() => {
        vhead.updateAllDraggedIndexes(null);
        setIsDragging(null);
      }}
      onDragStart={(colId) => {
        setIsDragging(colId);
        vhead.headerGroups.forEach((headerGroup, headerIndex) => {
          const col = headerGroup.headers.findIndex(
            (header) => header.id === colId,
          );
          if (col !== -1) {
            vhead.updateDraggedIndex(headerIndex, col);
          }
        });
      }}
      DndContext={DndColContext}
      displacements={React.useMemo(() => {
        const state = table.getState();
        const r = bodyCols.map((vc) => ({
          id: vhead.body.headerGroup.headers[vc.index].id,
          index: vc.index,
          size: vc.size,
          start: vc.start,
          end: vc.end,
          extra:
            vhead.body.headerGroup.headers[vc.index].column.getAfter("right"),
        }));

        const getRange = (
          indexRange: [number, number],
        ): { index: [number, number]; start: [number, number] } => {
          const end = r.find(
            (vc) => vc.index === indexRange[indexRange.length - 1],
          );
          return {
            index: indexRange,
            start: [
              r.find((vc) => vc.index === indexRange[0])?.start ?? 0,
              (end?.start ?? r.length - 1) + (end?.size ?? props.rowHeight),
            ],
          };
        };
        let range = getRange([0, r.length - 1]);

        if (vhead.defaultColWindowRef.current) {
          const currentWindow = vhead.defaultColWindowRef.current;
          range = getRange([
            vhead.body.headerGroup.headers[currentWindow[0]].index,
            vhead.body.headerGroup.headers[
              currentWindow[currentWindow.length - 1]
            ].index,
          ]);
        }
        const mapPinnedItem = (id: string): Item => {
          const item = table.getColumn(id);
          if (!item) {
            throw new Error("No item");
          }
          const pinned = item.getIsPinned();

          return {
            id,
            index: item.getIndex(), // real index
            size: item.getSize(),
            start: item.getStart(pinned),
            pinned:
              pinned === "left" ? "start" : pinned === "right" ? "end" : false,
          };
        };

        const pinnedLeft = (state.columnPinning.left ?? []).map(mapPinnedItem);
        const pinnedRight = (state.columnPinning.right ?? []).map(
          mapPinnedItem,
        );
        // console.log("@pinnedLeft", pinnedLeft, r);

        return {
          pinnedLeft,
          pinnedRight,
          calculateDisplacements: (delta: number, draggedId: string) => {
            const sel = r.filter((r) => r.id === draggedId);

            const displayedRange = r.filter(
              (r) => r.index >= range.index[0] && r.index <= range.index[1],
            );
            const displacements = calculateDisplacement2(
              displayedRange,
              sel,
              delta,
            );
            const displacedDisplayedRange = r.filter(
              (r) =>
                displacements.newItemIndices[r.id] >= range.index[0] &&
                displacements.newItemIndices[r.id] <= range.index[1],
            );
            return {
              ...displacements,
              displacedDisplayedRange: new Set(
                displacedDisplayedRange.map((r) => r.id),
              ),
            };
            // return calculateDisplacement(r, sel, delta, range);
          },
          findDeltaAtPosition(
            estimatedDelta: number,
            position: number,
            dragged: DndActive,
          ) {
            const sel = r.find((r) => r.id === dragged.id);
            const delta = findDeltaAtPosition({
              lastIndex: rows.length - 1,
              draggedId: dragged.id,
              inRangeItems: r.filter(
                (r) => r.index >= range.index[0] && r.index <= range.index[1],
              ),
              selectedItems: [
                {
                  id: dragged.id,
                  index: dragged.index,
                  size: sel?.size ?? 0,
                  start: sel?.start ?? 0,
                },
              ],
              cursorPosition: position,
              estimatedDelta,
            });
            // console.log("@delta", delta, position);
            return delta;
          },
        };
      }, [bodyCols, vhead.headerGroups])}
    >
      <DndProvider
        table={table}
        v2={{
          items: virtualRows.map((vc) => {
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
          }),
          window: {
            numItems: rows.length,
            scroll: 0,
            size: props.height,
            totalSize: rowVirtualizer.getTotalSize(),
          },
          selected: table.getSelectedRowModel().rows.map((r) => r.id),
        }}
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
        displacements={React.useMemo(() => {
          const r = virtualRows.map((vc) => ({
            id: rows[vc.index].id,
            index: vc.index,
            size: vc.size,
            start: vc.start,
          }));

          const selected = table.getState().rowSelection;
          const getRange = (
            indexRange: [number, number],
          ): { index: [number, number]; start: [number, number] } => {
            const end = r.find(
              (vc) => vc.index === indexRange[indexRange.length - 1],
            );
            return {
              index: indexRange,
              start: [
                r.find((vc) => vc.index === indexRange[0])?.start ?? 0,
                (end?.start ?? r.length - 1) + (end?.size ?? props.rowHeight),
              ],
            };
          };
          let range = getRange([0, r.length - 1]);

          if (defaultRowWindowRef.current) {
            const currentWindow = defaultRowWindowRef.current;
            range = getRange([
              rows[currentWindow[0]].index,
              rows[currentWindow[currentWindow.length - 1]].index,
            ]);
          }
          return {
            calculateDisplacements: (delta: number, draggedId: string) => {
              const sel =
                table.getIsSomeRowsSelected() && selected[draggedId]
                  ? r.filter((r) => selected[r.id])
                  : r.filter((r) => r.id === draggedId);

              const displayedRange = r.filter(
                (r) => r.index >= range.index[0] && r.index <= range.index[1],
              );
              const displacements = calculateDisplacement2(
                displayedRange,
                sel,
                delta,
              );
              const displacedDisplayedRange = r.filter(
                (r) =>
                  displacements.newItemIndices[r.id] >= range.index[0] &&
                  displacements.newItemIndices[r.id] <= range.index[1],
              );
              return {
                ...displacements,
                displacedDisplayedRange: new Set(
                  displacedDisplayedRange.map((r) => r.id),
                ),
              };
              // return calculateDisplacement(r, sel, delta, range);
            },
            findDeltaAtPosition(
              estimatedDelta: number,
              position: number,
              dragged: DndActive,
            ) {
              const draggedId = dragged.id;
              const draggedIndex = dragged.index;
              const sel =
                table.getIsSomeRowsSelected() && selected[draggedId]
                  ? r.filter((r) => selected[r.id])
                  : r.filter((r) => r.id === draggedId);
              return findDeltaAtPosition({
                draggedId,
                lastIndex: rows.length - 1,
                inRangeItems: r.filter(
                  (r) => r.index >= range.index[0] && r.index <= range.index[1],
                ),
                selectedItems: sel,
                cursorPosition: position,
                estimatedDelta,
              });
            },
            pinnedLeft: [],
            pinnedRight: [],
          };
        }, [rows, table, virtualRows, table.getSelectedRowModel()])}
        selected={React.useMemo(() => {
          return {
            state: table.getState().rowSelection,
          };
        }, [table.getSelectedRowModel()])}
        getSize={React.useCallback(
          (id) => {
            const row = table.getRow(id);
            if (!row) {
              throw new Error("No row");
            }
            const size =
              rowVirtualizer.measurementsCache[getFlatIndex(row)].size;
            return size ?? props.rowHeight;
          },
          [rowVirtualizer.measurementsCache, table],
        )}
        getStart={React.useCallback(
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
            return (
              rowVirtualizer.measurementsCache[getFlatIndex(row)].start ??
              estimateStart(getFlatIndex(row))
            );
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
            {vhead.headerGroups.map((headerGroup, headerIndex, arr) => {
              const { virtualColumns, virtualizer } =
                vhead.getVirtualHeaders(headerIndex);

              return renderHeaderGroup({
                headerGroup,
                virtualColumns,
                virtualizer,
                isClosestToTable: headerIndex === arr.length - 1,
                isDragging: Boolean(isDragging),
                table,
                defToRender: "header",
                rowHeight: props.rowHeight,
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

              return renderHeaderGroup({
                headerGroup: footerGroup,
                virtualColumns,
                virtualizer,
                isClosestToTable: footerIndex === 0,
                isDragging: Boolean(isDragging),
                table,
                defToRender: "footer",
                rowHeight: props.rowHeight,
              });
            })}
          </div>
        </div>
      </DndProvider>
    </DndProvider>
  );
};
