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
  Table,
  useReactTable,
} from "@tanstack/react-table";
import { CSSProperties, useState } from "react";
import "./App.css";
import { generateTableData, Row } from "./generate_table_data";
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
} from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
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
  Virtualizer,
  VirtualizerOptions,
} from "@tanstack/react-virtual";
import { flushSync } from "react-dom";

const tableRowHeight = 32;

const columnHelper = createColumnHelper<Row>();

const columns = [
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
  header: Header<Row, unknown>;
  table: Table<Row>;
}) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform: _transform,
  } = useSortable({
    id: header.column.id,
  });

  const transform: Transform | null = _transform
    ? { ..._transform, y: 0 }
    : null;

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: "width transform 0.2s ease-in-out",
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

const getCommonPinningStyles = (column: Column<Row>): CSSProperties => {
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

const DragAlongCell = ({ cell }: { cell: Cell<Row, unknown> }) => {
  const {
    isDragging,
    setNodeRef,
    transform: _transform,
  } = useSortable({
    id: cell.column.id,
  });

  const transform: Transform | null = _transform
    ? { ..._transform, y: 0 }
    : null;

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: "width transform 0.2s ease-in-out",
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

const data = generateTableData(10000);

function App() {
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(() => {
    const iterateOverColumns = (columns: ColumnDef<Row, any>[]): string[] => {
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

  // reorder columns after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    setIsDragging(false);
    updateAllDraggedIndexes(null);
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
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

  const { rows } = table.getRowModel();

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
          }
        }
        const pinnedHeaders: Header<Row, unknown>[] = [];
        const unpinnedHeaders: Header<Row, unknown>[] = [];
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

  // for the last col and the rest of the table body
  const getBodyVirtualCols = () => {
    return getVirtualCols(headerGroups.length - 1);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
      autoScroll={{
        threshold: { x: 0.2, y: 0 },
      }}
      onDragEnd={handleDragEnd}
      onDragAbort={() => {
        updateAllDraggedIndexes(null);
        setIsDragging(false);
      }}
      onDragCancel={() => {
        updateAllDraggedIndexes(null);
        setIsDragging(false);
      }}
      onDragStart={(ev) => {
        setIsDragging(true);
        const id = ev.active.id;
        if (id && typeof id === "string") {
          const col = table.getColumn(id);
          if (col) {
            const index = col.getIndex();
            if (index !== -1) {
              updateAllDraggedIndexes(null);
            }
          }
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
            width: "fit-content",
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
                style={{ display: "flex", height: tableRowHeight }}
              >
                {headerIndex !== arr.length - 1 ? (
                  isDragging ? null : (
                    <>
                      {virtualColumns
                        .map((vc) => headerGroup.headers[vc.index])
                        .filter(
                          (header) => header.column.getIsPinned() === "left",
                        )
                        .map((header) => {
                          return (
                            <DisplayHeader key={header.id} header={header} />
                          );
                        })}
                      {virtualPaddingLeft ? (
                        //fake empty column to the left for virtualization scroll padding
                        <div
                          style={{
                            display: "flex",
                            width: `calc(var(--virtual-padding-left-${headerIndex}, 0) * 1px)`,
                          }}
                        />
                      ) : null}
                      {virtualColumns
                        .map((vc) => headerGroup.headers[vc.index])
                        .filter((header) => !header.column.getIsPinned())
                        .map((header) => {
                          return (
                            <DisplayHeader key={header.id} header={header} />
                          );
                        })}
                      {virtualPaddingRight ? (
                        //fake empty column to the left for virtualization scroll padding
                        <div
                          style={{
                            display: "flex",
                            width: `calc(var(--virtual-padding-right-${headerIndex}, 0) * 1px)`,
                          }}
                        />
                      ) : null}
                      {virtualColumns
                        .map((vc) => headerGroup.headers[vc.index])
                        .filter(
                          (header) => header.column.getIsPinned() === "right",
                        )
                        .map((header) => {
                          return (
                            <DisplayHeader key={header.id} header={header} />
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
                      .filter(
                        (header) => header.column.getIsPinned() === "left",
                      )
                      .map((header) => {
                        return (
                          <DraggableTableHeader
                            key={header.id}
                            header={header}
                            table={table}
                          />
                        );
                      })}
                    {virtualPaddingLeft ? (
                      //fake empty column to the left for virtualization scroll padding
                      <div
                        style={{
                          display: "flex",
                          width: `calc(var(--virtual-padding-left-${headerIndex}, 0) * 1px)`,
                        }}
                      />
                    ) : null}
                    {virtualColumns
                      .map((vc) => headerGroup.headers[vc.index])
                      .filter((header) => !header.column.getIsPinned())
                      .map((header) => {
                        return (
                          <DraggableTableHeader
                            key={header.id}
                            header={header}
                            table={table}
                          />
                        );
                      })}
                    {virtualPaddingRight ? (
                      //fake empty column to the right for virtualization scroll padding
                      <div
                        style={{
                          display: "flex",
                          width: `calc(var(--virtual-padding-right-${headerIndex}, 0) * 1px)`,
                        }}
                      />
                    ) : null}
                    {virtualColumns
                      .map((vc) => headerGroup.headers[vc.index])
                      .filter(
                        (header) => header.column.getIsPinned() === "right",
                      )
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
          style={
            {
              // maxWidth: table.getTotalSize(),
            }
          }
        >
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            const visibileCells = row.getVisibleCells();
            const { virtualPaddingLeft, virtualPaddingRight, virtualColumns } =
              getBodyVirtualCols();
            return (
              <div
                key={row.id}
                style={{
                  position: "absolute",
                  // transform: `translate3d(calc(var(--virtual-padding-left, 0) * 1px), ${virtualRow.start}px, 0)`,
                  transform: `translate3d(0, ${virtualRow.start}px, 0)`,
                }}
                {...{
                  className: "tr",
                }}
              >
                {visibileCells
                  .filter((cell) => cell.column.getIsPinned() === "left")
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
                {virtualPaddingLeft ? (
                  //fake empty column to the left for virtualization scroll padding
                  <div
                    style={{
                      display: "flex",
                      width: `calc(var(--virtual-padding-left, 0) * 1px)`,
                    }}
                  />
                ) : null}
                {virtualColumns
                  .map((virtualColumn) => visibileCells[virtualColumn.index])
                  .filter((cell) => !cell.column.getIsPinned())
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
                {virtualPaddingRight ? (
                  //fake empty column to the right for virtualization scroll padding
                  <div
                    style={{
                      display: "flex",
                      width: `calc(var(--virtual-padding-right, 0) * 1px)`,
                    }}
                  />
                ) : null}
                {visibileCells
                  .filter((cell) => cell.column.getIsPinned() === "right")
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
                {/* {row.getVisibleCells().map((cell) => {
                  return (
                    <SortableContext
                      key={cell.id}
                      items={columnOrder}
                      strategy={horizontalListSortingStrategy}
                    >
                      <DragAlongCell key={cell.id} cell={cell} />
                    </SortableContext>
                  );
                })} */}
              </div>
            );
          })}
        </div>

        {/* <div
          {...{
            className: "divTable",
            style: {
              width: table.getTotalSize(),
            },
          }}
        > 
        <MemoizedTableBody table={table} columnOrder={columnOrder} />
        </div> */}
      </div>
    </DndContext>
  );
}

function DisplayHeader({ header }: { header: Header<Row, unknown> }) {
  return (
    <div
      key={header.id}
      {...{
        className: "th",
        style: {
          ...getCommonPinningStyles(header.column),
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

// function TableBody({
//   table,
//   columnOrder,
// }: {
//   table: Table<Row>;
//   columnOrder: string[];
// }) {
//   return (

//   );
// }

// export const MemoizedTableBody = React.memo(
//   TableBody,
//   (prev, next) =>
//     prev.table.options.data === next.table.options.data &&
//     prev.columnOrder === next.columnOrder,
// ) as typeof TableBody;

export default App;
