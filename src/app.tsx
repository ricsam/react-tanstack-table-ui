import {
  Cell,
  Column,
  ColumnDef,
  ColumnOrderState,
  ColumnSizingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  Header,
  Row,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import { CSSProperties, useState } from "react";
import "./App.css";
import { generateTableData, User } from "./generate_table_data";
import React from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
  closestCorners,
  pointerWithin,
  rectIntersection,
  DragOverlay,
} from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// needed for row & cell level scope DnD setup
import { useSortable } from "@dnd-kit/sortable";
import { CSS, Transform } from "@dnd-kit/utilities";
import {
  defaultRangeExtractor,
  elementScroll,
  observeElementOffset,
  observeElementRect,
  useVirtualizer,
  VirtualItem,
  Virtualizer,
  VirtualizerOptions,
} from "@tanstack/react-virtual";
import { flushSync } from "react-dom";

// Cell Component
const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
    data: {
      type: "row",
    },
  });
  return (
    // Alternatively, you could set these attributes on the rows themselves
    <button {...attributes} {...listeners}>
      🟰
    </button>
  );
};

const tableRowHeight = 32;

const columnHelper = createColumnHelper<User>();

const columns: ColumnDef<User, any>[] = [
  {
    id: "drag-handle",
    header: "Move",
    cell: ({ row }) => <RowDragHandleCell rowId={row.id} />,
    size: 60,
  },
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => info.getValue(),
    id: "id",
  }),
  columnHelper.accessor("fullName", {
    header: "Full Name",
    cell: (info) => info.getValue(),
    id: "full-name",
    size: 200,
  }),
  columnHelper.accessor("location", {
    header: "Location",
    cell: (info) => info.getValue(),
    id: "location",
    size: 200,
  }),
  columnHelper.accessor("country", {
    header: "Country",
    cell: (info) => info.getValue(),
    id: "country",
  }),
  columnHelper.accessor("continent", {
    header: "Continent",
    cell: (info) => info.getValue(),
    id: "continent",
    size: 200,
  }),
  columnHelper.accessor("countryCode", {
    header: "Country Code",
    cell: (info) => info.getValue(),
    id: "country-code",
    size: 200,
  }),
  columnHelper.accessor("language", {
    header: "Language",
    cell: (info) => info.getValue(),
    id: "language",
    size: 200,
  }),
  columnHelper.accessor("favoriteGame", {
    header: "Favorite Game",
    cell: (info) => info.getValue(),
    id: "favorite-game",
    size: 200,
  }),
  columnHelper.accessor("birthMonth", {
    header: "Birth Month",
    cell: (info) => info.getValue(),
    id: "birth-month",
    size: 200,
  }),
  columnHelper.accessor("isActive", {
    header: "Active",
    cell: (info) => (info.getValue() ? "Yes" : "No"),
    id: "is-active",
    size: 200,
  }),
  columnHelper.group({
    header: "Winnings",
    id: "winnings",
    columns: [
      columnHelper.accessor((data) => data.yearlyWinnings[2021], {
        id: "winnings-2021",
        header: "2021",
        cell: (info) => `$${info.getValue().toLocaleString()}`,
      }),
      columnHelper.accessor((data) => data.yearlyWinnings[2022], {
        id: "winnings-2022",
        header: "2022",
        cell: (info) => `$${info.getValue().toLocaleString()}`,
      }),
      columnHelper.accessor((data) => data.yearlyWinnings[2023], {
        id: "winnings-2023",
        header: "2023",
        cell: (info) => `$${info.getValue().toLocaleString()}`,
      }),
    ],
  }),
  columnHelper.accessor("experienceYears", {
    header: "Experience (Years)",
    cell: (info) => info.getValue(),
    id: "experience-years",
    size: 200,
  }),
  columnHelper.accessor("rating", {
    header: "Rating",
    cell: (info) => info.getValue().toFixed(1),
    id: "rating",
    size: 200,
  }),
  columnHelper.accessor("completedProjects", {
    header: "Completed Projects",
    cell: (info) => info.getValue(),
    id: "completed-projects",
    size: 200,
  }),
  columnHelper.accessor("department", {
    header: "Department",
    cell: (info) => info.getValue(),
    id: "department",
    size: 200,
  }),
];

const DraggableTableHeader = ({
  header,
  table,
}: {
  header: Header<User, unknown>;
  table: Table<User>;
}) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform: _transform,
    transition,
  } = useSortable({
    id: header.column.id,
    data: {
      type: "col",
    },
  });

  const dragTransform = _transform ? ` + ${_transform.x}px` : "";

  const transform = header.column.getIsPinned()
    ? CSS.Translate.toString(_transform ? { ..._transform, y: 0 } : null)
    : `translate3d(calc(var(--virtual-padding-left, 0) * 1px${dragTransform}), 0, 0)`;

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    // transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transform,
    transition,
    whiteSpace: "nowrap",
    zIndex: isDragging ? 1 : 0,
    display: "flex",
    paddingRight: "8px",
    paddingLeft: "8px",
    overflow: "hidden",
    height: "32px",
    ...getCommonPinningStyles(header.column),
    width: `calc(var(--header-${header?.id}-size) * 1px)`,
  };

  return (
    <div
      key={header.id}
      ref={setNodeRef}
      {...{
        className: "th",
        style,
      }}
    >
      <div style={{ textAlign: "center", flex: 1 }}>
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
        <div style={{ width: "4px" }}></div>
      </div>
      {header.subHeaders.length === 0 && !header.column.getIsPinned() && (
        <button {...attributes} {...listeners}>
          🟰
        </button>
      )}
      {!header.isPlaceholder && header.column.getCanPin() && (
        <div className="flex gap-1 justify-center">
          {header.column.getIsPinned() !== "left" ? (
            <button
              className="border rounded px-2"
              onClick={() => {
                header.column.pin("left");
                // table.resetColumnSizing(true);
              }}
            >
              {"<="}
            </button>
          ) : null}
          {header.column.getIsPinned() ? (
            <button
              className="border rounded px-2"
              onClick={() => {
                header.column.pin(false);
                // table.resetColumnSizing(true);
              }}
            >
              X
            </button>
          ) : null}
          {header.column.getIsPinned() !== "right" ? (
            <button
              className="border rounded px-2"
              onClick={() => {
                header.column.pin("right");
                // table.resetColumnSizing(true);
              }}
            >
              {"=>"}
            </button>
          ) : null}
        </div>
      )}
      <div
        {...{
          onDoubleClick: () => header.column.resetSize(),
          onMouseDown: header.getResizeHandler(),
          onTouchStart: header.getResizeHandler(),
          className: `resizer ${
            header.column.getIsResizing() ? "isResizing" : ""
          }`,
        }}
      />
    </div>
  );
};

const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;

const getCommonPinningStyles = (column: Column<User>): CSSProperties => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");

  const style: CSSProperties = {
    boxShadow: isLastLeftPinnedColumn
      ? "-4px 0 4px -4px gray inset"
      : isFirstRightPinnedColumn
        ? "4px 0 4px -4px gray inset"
        : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
    background: isPinned ? "black" : "transparent",
  };
  if (isPinned) {
    style.transform = "none";
  }
  return style;
};

const DragAlongCell = ({ cell }: { cell: Cell<User, unknown> }) => {
  const {
    isDragging,
    setNodeRef,
    transform: _transform,
    transition,
  } = useSortable({
    id: cell.column.id,
    data: {
      type: "col",
    },
  });

  // const transform: Transform | null = _transform
  //   ? { ..._transform, y: 0 }
  //   : null;

  const dragTransform = _transform ? ` + ${_transform.x}px` : "";

  const transform = cell.column.getIsPinned()
    ? CSS.Translate.toString(_transform ? { ..._transform, y: 0 } : null)
    : `translate3d(calc(var(--virtual-padding-left, 0) * 1px${dragTransform}), 0, 0)`;

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    // transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transform,
    transition,
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
    height: "32px",
  };

  // let u = 0;
  // for (let i = 0; i < 10000; i += 1) {
  //   // slow
  //   u += Math.random();
  // }

  return (
    <div
      key={cell.id}
      ref={setNodeRef}
      {...{
        className: "td",
        style: {
          ...style,
          ...getCommonPinningStyles(cell.column),
          width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </div>
  );
};

function App() {
  const [data, setData] = React.useState<User[]>(() => generateTableData(1000));
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(() => {
    const iterateOverColumns = (columns: ColumnDef<User, any>[]): string[] => {
      return columns.flatMap((column): string[] => {
        if ("columns" in column && column.columns) {
          return iterateOverColumns(column.columns);
        }
        const id = column.id;
        if (!id) {
          throw new Error("All columns must have an id");
        }
        return [id];
      });
    };
    return iterateOverColumns(columns);
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder,
    },
    getRowId(originalRow, index, parent) {
      return String(originalRow.id);
    },
    onColumnOrderChange: setColumnOrder,
    defaultColumn: {
      minSize: 60,
      maxSize: 800,
    },
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
  });
  const columnSizeVars = React.useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return colSizes;

    /* eslint-disable react-hooks/exhaustive-deps */
  }, [
    table.getState().columnSizingInfo,
    table.getState().columnSizing,
    columnOrder,
  ]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const { rows } = table.getRowModel();
  const rowIds = React.useMemo(() => rows.map((row) => row.id), [rows]);

  // reorder columns after drag & drop
  function handleColDragEnd(event: DragEndEvent) {
    setIsDragging(false);
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(String(active.id));
        const newIndex = columnOrder.indexOf(String(over.id));
        return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
      });
    }
  }

  function handleRowDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = rowIds.indexOf(String(active.id));
        const newIndex = rowIds.indexOf(String(over.id));
        return arrayMove(data, oldIndex, newIndex); //this is just a splice util
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const width = 640;
  const height = 640;

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const _draggedIndexRef = React.useRef<(number | null)[]>(
    table.getHeaderGroups().map(() => null),
  );
  const visibleColsOutsideVirtualRange = React.useRef(
    table.getHeaderGroups().map(() => new Set<number>()),
  );

  const updateDraggedIndex = (headerIndex: number, val: number | null) => {
    if (!val && _draggedIndexRef.current[headerIndex]) {
      visibleColsOutsideVirtualRange.current[headerIndex].delete(
        _draggedIndexRef.current[headerIndex],
      );
    }
    _draggedIndexRef.current[headerIndex] = val;
  };

  const getDraggedIndex = (headerIndex: number) =>
    _draggedIndexRef.current[headerIndex];

  const [isDragging, setIsDragging] = useState(false);
  const baseColVirtOpts = (
    headerIndex: number,
  ): Pick<
    VirtualizerOptions<HTMLDivElement, Element>,
    "getScrollElement" | "horizontal" | "overscan" | "rangeExtractor"
  > => {
    const headers = table.getHeaderGroups()[headerIndex].headers;
    return {
      getScrollElement: () => tableContainerRef.current,
      horizontal: true,
      overscan: 3, //how many columns to render on each side off screen each way (adjust this for performance)
      rangeExtractor: (range) => {
        const draggedIndex = getDraggedIndex(headerIndex);
        const next = new Set(defaultRangeExtractor(range));
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
        const pinnedHeaders: Header<User, unknown>[] = [];
        const unpinnedHeaders: Header<User, unknown>[] = [];
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
              visibleColsOutsideVirtualRange.current[headerIndex].delete(index);
            }
          }
        });
        unpinnedHeaders.forEach((col) => {
          const index = col.index;
          if (index === draggedIndex) {
            return;
          }
          if (visibleColsOutsideVirtualRange.current[headerIndex].has(index)) {
            visibleColsOutsideVirtualRange.current[headerIndex].delete(index);
          }
        });
        return [...next].sort((a, b) => a - b);
      },
    };
  };

  const headerGroups = table.getHeaderGroups();
  const rerender = React.useReducer(() => ({}), {})[1];

  const updateAllDraggedIndexes = (val: number | null) => {
    headerGroups.forEach((_, headerIndex) => {
      updateDraggedIndex(headerIndex, val);
    });
  };

  const headerColVirtualizerOptions = headerGroups.map(
    (headerGroup, headerIndex): VirtualizerOptions<HTMLDivElement, Element> => {
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

  const [headerColVirtualizers] = React.useState(() => {
    return headerColVirtualizerOptions.map((options) => {
      return new Virtualizer(options);
    });
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

  const draggedRowRef = React.useRef<string | null>(null);

  //dynamic row height virtualization - alternatively you could use a simpler fixed row height strategy without the need for `measureElement`
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => tableRowHeight, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    // measureElement:
    //   typeof window !== "undefined" &&
    //   navigator.userAgent.indexOf("Firefox") === -1
    //     ? (element) => element?.getBoundingClientRect().height
    //     : undefined,
    overscan: 5,
    rangeExtractor(range) {
      const next = new Set(defaultRangeExtractor(range));
      if (draggedRowRef.current !== null) {
        next.add(rowIds.indexOf(draggedRowRef.current));
      }
      const n = [...next].sort((a, b) => a - b);
      return n;
    },
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  headerColVirtualizers.forEach((cv, i) => {
    cv.setOptions(headerColVirtualizerOptions[i]);
    headerGroups[i].headers.forEach((header, j) => {
      cv.resizeItem(j, header.getSize());
    });
  });

  //different virtualization strategy for columns - instead of absolute and translateY, we add empty columns to the left and right
  const getVirtualCols = (headerIndex: number) => {
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

      virtualPaddingLeft = virtualColumnsStart?.start ?? 0;
      virtualPaddingRight =
        virtualizer.getTotalSize() - (virtualColumnsEnd?.end ?? 0);
    }
    return { virtualPaddingLeft, virtualPaddingRight, virtualColumns };
  };

  const colScrollVars: { [key: string]: number | undefined } = {};

  headerGroups.forEach((_, headerIndex) => {
    const { virtualPaddingLeft, virtualPaddingRight } =
      getVirtualCols(headerIndex);
    Object.assign(colScrollVars, {
      [`--virtual-padding-left-${headerIndex}`]: virtualPaddingLeft,
      [`--virtual-padding-right-${headerIndex}`]: virtualPaddingRight,
    });

    if (headerIndex === headerGroups.length - 1) {
      Object.assign(colScrollVars, {
        "--virtual-padding-left": virtualPaddingLeft,
        "--virtual-padding-right": virtualPaddingRight,
      });
    }
  });

  const tableVars: { [key: string]: number } = {
    "--virtual-offset-top":
      virtualRows.find((row) =>
        draggedRowRef.current
          ? row.index !== rowIds.indexOf(draggedRowRef.current)
          : true,
      )?.start ?? 0,
  };

  // for the last col and the rest of the table body
  const getBodyVirtualCols = () => {
    return getVirtualCols(headerGroups.length - 1);
  };

  const [activeDrag, setActiveDrag] = React.useState<"row" | "col">("col");

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[
        activeDrag === "col"
          ? restrictToHorizontalAxis
          : restrictToVerticalAxis,
        restrictToParentElement,
      ]}
      autoScroll={{
        threshold: activeDrag === "col" ? { x: 0.2, y: 0 } : { x: 0, y: 0.2 },
      }}
      onDragEnd={(ev) => {
        if (activeDrag === "col") {
          handleColDragEnd(ev);
        } else {
          handleRowDragEnd(ev);
        }
        updateAllDraggedIndexes(null);
        setActiveDrag("col");
        draggedRowRef.current = null;
      }}
      onDragAbort={() => {
        updateAllDraggedIndexes(null);
        setIsDragging(false);
        draggedRowRef.current = null;
      }}
      onDragCancel={() => {
        updateAllDraggedIndexes(null);
        setIsDragging(false);
        draggedRowRef.current = null;
      }}
      onDragStart={(ev) => {
        if (ev.active.data.current?.type === "row") {
          setActiveDrag("row");
          const id = ev.active.id;
          if (id && typeof id === "string") {
            draggedRowRef.current = id;
          }
          return;
        } else {
          setActiveDrag("col");
        }
        if (activeDrag === "row") {
          return;
        }
        setIsDragging(true);
        const id = ev.active.id;
        if (id && typeof id === "string") {
          headerGroups.forEach((headerGroup, headerIndex) => {
            const col = headerGroup.headers.findIndex(
              (header) => header.id === id,
            );
            if (col && col !== -1) {
              updateDraggedIndex(headerIndex, col);
            }
          });
        }
      }}
      sensors={sensors}
    >
      <div
        ref={tableContainerRef}
        style={{
          overflow: "auto",
          width: "640px",
          height: "640px",
          position: "relative",
          ...columnSizeVars,
          ...colScrollVars,
          ...tableVars,
        }}
      >
        <div
          className="table-scroller"
          style={{
            width: table.getTotalSize(),
            height: data.length * tableRowHeight,
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
          {table.getHeaderGroups().map((headerGroup, headerIndex, arr) => {
            const { virtualPaddingLeft, virtualPaddingRight, virtualColumns } =
              getVirtualCols(headerIndex);
            return (
              <div
                key={headerGroup.id}
                {...{
                  className: "tr",
                }}
                style={{
                  display: "flex",
                  height: tableRowHeight,
                  // transform: `translate3d(calc(var(--virtual-padding-left-${headerIndex}, 0) * 1px), 0, 0)`,
                }}
              >
                {headerIndex !== arr.length - 1 ? (
                  isDragging ? null : (
                    <>
                      {virtualColumns
                        .map((vc) => headerGroup.headers[vc.index])
                        .map((header) => {
                          return (
                            <DisplayHeader
                              key={header.id}
                              header={header}
                              headerIndex={headerIndex}
                            />
                          );
                        })}
                    </>
                  )
                ) : (
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {virtualColumns
                      .map((vc) => headerGroup.headers[vc.index])
                      .map((header) => {
                        return (
                          <DraggableTableHeader
                            key={header.id}
                            header={header}
                            table={table}
                          />
                        );
                      })}
                  </SortableContext>
                )}
              </div>
            );
          })}
        </div>

        <div
          {...{
            className: "tbody",
          }}
          style={{
            // maxWidth: table.getTotalSize(),
            position: "relative",
            transform: `translate3d(0, calc(var(--virtual-offset-top, 0) * 1px), 0)`,
            // top: virtualRows[0].start,
          }}
        >
          <SortableContext
            items={rowIds}
            strategy={verticalListSortingStrategy}
          >
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];

              const { virtualColumns } = getBodyVirtualCols();
              return (
                <TableRow
                  key={row.id}
                  row={row}
                  virtualOffsetTop={virtualRow.start}
                  columnOrder={columnOrder}
                  virtualColumns={virtualColumns}
                />
              );
            })}
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
}

function DisplayHeader({
  header,
  headerIndex,
}: {
  header: Header<User, unknown>;
  headerIndex: number;
}) {
  return (
    <div
      key={header.id}
      {...{
        className: "th",
        style: {
          ...getCommonPinningStyles(header.column),
          transform: header.column.getIsPinned()
            ? "none"
            : `translate3d(calc(var(--virtual-padding-left-${headerIndex}, 0) * 1px), 0, 0)`,
          transition: "width transform 0.2s ease-in-out",
          whiteSpace: "nowrap",
          display: "flex",
          paddingRight: "8px",
          paddingLeft: "8px",
          overflow: "hidden",
          height: "32px",
          width: `calc(var(--header-${header?.id}-size) * 1px)`,
        },
      }}
    >
      <div style={{ textAlign: "center", flex: 1 }}>
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
        <div style={{ width: "4px" }}></div>
      </div>
      <div
        {...{
          onDoubleClick: () => header.column.resetSize(),
          onMouseDown: header.getResizeHandler(),
          onTouchStart: header.getResizeHandler(),
          className: `resizer ${
            header.column.getIsResizing() ? "isResizing" : ""
          }`,
        }}
      />
    </div>
  );
}

function TableRow({
  row,
  virtualOffsetTop,
  columnOrder,
  virtualColumns,
}: {
  row: Row<User>;
  virtualOffsetTop: number;
  columnOrder: ColumnOrderState;
  virtualColumns: VirtualItem[];
}) {
  const visibileCells = row.getVisibleCells();

  const {
    transform: _transform,
    transition,
    setNodeRef,
    isDragging,
  } = useSortable({
    id: row.id,
    data: {
      type: "row",
    },
  });

  const transform: Transform | null = _transform
    ? { ..._transform, x: 0 }
    : null;

  return (
    <div
      style={{
        position: "relative",
        // transform: `translate3d(calc(var(--virtual-padding-left, 0) * 1px), ${virtualRow.start}px, 0)`,
        // transform: `translate3d(0, ${virtualOffsetTop}px, 0)`,
        // transform: transform
        //   ? CSS.Transform.toString(transform)
        //   : `translate3d(0, ${virtualOffsetTop}px, 0)`,
        transform: CSS.Transform.toString(transform),
        // top: virtualOffsetTop,
        transition: transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1 : 0,
      }}
      ref={setNodeRef}
      className="tr"
    >
      {virtualColumns
        .map((virtualColumn) => visibileCells[virtualColumn.index])
        .map((cell) => {
          return (
            <SortableContext
              key={cell.id}
              items={columnOrder}
              strategy={horizontalListSortingStrategy}
            >
              <DragAlongCell key={cell.id} cell={cell} />
            </SortableContext>
          );
        })}
    </div>
  );
}

export default App;
