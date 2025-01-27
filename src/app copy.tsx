import {
  Cell,
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
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

// needed for row & cell level scope DnD setup
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

const columnHelper = createColumnHelper<User>();

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
  header: Header<User, unknown>;
  table: Table<User>;
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: "width transform 0.2s ease-in-out",
    whiteSpace: "nowrap",
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
    display: "flex",
    paddingRight: "8px",
    paddingLeft: "8px",
    overflow: "hidden",
    height: "32px",
  };

  return (
    <div
      key={header.id}
      ref={setNodeRef}
      {...{
        className: "th",
        style: {
          ...style,
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
                table.resetColumnSizing(true);
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
                table.resetColumnSizing(true);
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
                table.resetColumnSizing(true);
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

const DragAlongCell = ({ cell }: { cell: Cell<User, unknown> }) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: "width transform 0.2s ease-in-out",
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
    height: "32px",
  };

  return (
    <div
      key={cell.id}
      ref={setNodeRef}
      {...{
        className: "td",
        style: {
          ...style,
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

  // reorder columns after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    draggedIndexRef.current = null;
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
      });
      // header.column.resetSize()
      table.resetColumnSizing(true);
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const width = 640;
  const height = 640;

  const visibleColumns = table.getVisibleLeafColumns();

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();

  const draggedIndexRef = React.useRef<number | null>(null);
  const baseColVirtOpts: Pick<
    VirtualizerOptions<HTMLDivElement, Element>,
    "getScrollElement" | "horizontal" | "overscan" | "rangeExtractor"
  > = {
    getScrollElement: () => tableContainerRef.current,
    horizontal: true,
    overscan: 3, //how many columns to render on each side off screen each way (adjust this for performance)
    rangeExtractor: (range) => {
      if (draggedIndexRef.current !== null) {
        const next = new Set([
          draggedIndexRef.current,
          ...defaultRangeExtractor(range),
        ]);
        return [...next].sort((a, b) => a - b);
      } else {
        return defaultRangeExtractor(range);
      }
    },
  };

  const columnVirtualizer = useVirtualizer({
    count: visibleColumns.length,
    estimateSize: (index) => {
      return visibleColumns[index].getSize();
    },
    ...baseColVirtOpts,
  });

  const headerGroups = table.getHeaderGroups();
  const rerender = React.useReducer(() => ({}), {})[1];

  const headerColVirtualizerOptions = headerGroups.map(
    (headerGroup): VirtualizerOptions<HTMLDivElement, Element> => {
      return {
        ...baseColVirtOpts,
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
  visibleColumns.forEach((column, i) => {
    columnVirtualizer.resizeItem(i, column.getSize());
  });

  //different virtualization strategy for columns - instead of absolute and translateY, we add empty columns to the left and right
  const getVirtualCols = (
    virtualizer: Virtualizer<HTMLDivElement, Element>,
  ) => {
    let virtualPaddingLeft: number | undefined;
    let virtualPaddingRight: number | undefined;

    const virtualColumns = virtualizer.getVirtualItems();

    if (virtualColumns.length) {
      virtualPaddingLeft = virtualColumns[0]?.start ?? 0;
      virtualPaddingRight =
        virtualizer.getTotalSize() -
        (virtualColumns[virtualColumns.length - 1]?.end ?? 0);
    }
    return { virtualPaddingLeft, virtualPaddingRight, virtualColumns };
  };

  const getHeaderVirtualCols = (headerIndex: number) => {
    const virtualizer = headerColVirtualizers[headerIndex];
    return getVirtualCols(virtualizer);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      onDragAbort={() => {
        draggedIndexRef.current = null;
      }}
      onDragCancel={() => {
        draggedIndexRef.current = null;
      }}
      onDragStart={(ev) => {
        const id = ev.active.id;
        if (id && typeof id === "string") {
          const col = table.getColumn(id);
          if (col) {
            const index = col.getIndex();
            if (index !== -1) {
              draggedIndexRef.current = index;
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
          {table.getHeaderGroups().map((headerGroup, headerIndex) => {
            const { virtualPaddingLeft, virtualPaddingRight, virtualColumns } =
              getHeaderVirtualCols(headerIndex);
            return (
              <div
                key={headerGroup.id}
                {...{
                  className: "tr",
                }}
                style={{ display: "flex" }}
              >
                <SortableContext
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  {virtualPaddingLeft ? (
                    //fake empty column to the left for virtualization scroll padding
                    <div
                      style={{ display: "flex", width: virtualPaddingLeft }}
                    />
                  ) : null}
                  {/* {headerGroup.headers.map((header) => ( */}
                  {virtualColumns.map((vc) => {
                    if (!vc || !vc.index) {
                      return;
                    }
                    const header = headerGroup.headers[vc.index];
                    if (!header) {
                      return;
                    }
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
                      style={{ display: "flex", width: virtualPaddingRight }}
                    />
                  ) : null}
                </SortableContext>
              </div>
            );
          })}
        </div>

        <div
          {...{
            className: "tbody",
          }}
          style={{
            maxWidth: table.getTotalSize(),
          }}
        >
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            const visibileCells = row.getVisibleCells();
            const { virtualPaddingLeft, virtualPaddingRight, virtualColumns } =
              getVirtualCols(columnVirtualizer);
            return (
              <div
                key={row.id}
                style={{
                  position: "absolute",
                  // transform: `translate3d(${virtualPaddingLeft ? `${virtualPaddingLeft}px` : "0"}, ${virtualRow.start}px, 0)`,
                  transform: `translate3d(0, ${virtualRow.start}px, 0)`,
                }}
                {...{
                  className: "tr",
                }}
              >
                {virtualPaddingLeft ? (
                  //fake empty column to the left for virtualization scroll padding
                  <div style={{ display: "flex", width: virtualPaddingLeft }} />
                ) : null}
                {virtualColumns.map((virtualColumn) => {
                  const cell = visibileCells[virtualColumn.index];
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
                    style={{ display: "flex", width: virtualPaddingRight }}
                  />
                ) : null}
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
