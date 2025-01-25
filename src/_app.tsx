import {
  Cell,
  Column,
  ColumnDef,
  ColumnOrderState,
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
  defaultRangeExtractor,
  elementScroll,
  observeElementOffset,
  observeElementRect,
  useVirtualizer,
  VirtualItem,
  Virtualizer,
  Range,
  VirtualizerOptions,
  // } from "@tanstack/react-virtual";
} from "./react-virtual";
import { flushSync } from "react-dom";
import { arrayMove } from "@dnd-kit/sortable";

// Cell Component
const RowDragHandleCell = ({
  rowId,
  rowIndex,
}: {
  rowId: string;
  rowIndex: number;
}) => {
  // const { attributes, listeners } = useSortable({
  //   id: rowId,
  //   data: {
  //     type: "row",
  //   },
  // });
  const { attributes, listeners } = useAnoDrag(
    AnoDndRowContext,
    rowId,
    tableRowHeight,
    rowIndex,
    rowIndex * tableRowHeight,
  );
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
    cell: ({ row }) => (
      <RowDragHandleCell rowId={row.id} rowIndex={row.index} />
    ),
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
for (let i = 0; i < 80; i += 1) {
  columns.push(
    columnHelper.accessor("department", {
      header: `Extra ${i}`,
      cell: (info) => info.getValue(),
      id: `extra-${i}`,
      size: 200,
    }),
  );
}

const DraggableTableHeader = ({
  header,
  table,
}: {
  header: Header<User, unknown>;
  table: Table<User>;
}) => {
  // const {
  //   attributes,
  //   isDragging,
  //   listeners,
  //   setNodeRef,
  //   transform: _transform,
  //   transition,
  // } = useSortable({
  //   id: header.column.id,
  //   data: {
  //     type: "col",
  //   },
  // });

  const {
    transform: _transform,
    isDragging,
    transition,
    setNodeRef,
    listeners,
    attributes,
  } = useAnoDrag(
    AnoDndColContext,
    header.column.id,
    header.column.getSize(),
    header.column.getIndex(),
    header.column.getStart(),
  );

  const dragTransform = _transform ? ` + ${_transform.x}px` : "";

  const transform = header.column.getIsPinned()
    ? "none"
    : `translate3d(calc(0px${dragTransform}), 0, 0)`;
  // : `translate3d(calc(var(--virtual-padding-left, 0) * 1px${dragTransform}), 0, 0)`;

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
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
    left: header.column.getStart(),
    position: "absolute",
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

type AnoDndActive = {
  id: string;
  mouseStart: { x: number; y: number };
  scrollStart: { x: number; y: number };
  handleOffset: { x: number; y: number };
  size: number;
  start: number;
  index: number;
};

type AnoDndContextType = {
  setIsDragging: React.Dispatch<React.SetStateAction<AnoDndActive | null>>;
  isDragging: AnoDndActive | null;
  delta: Delta;
  // cols: { size: number; id: string }[];
  closestCol: { size: number; id: string; index: number } | null;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onDragStart: (event: AnoDndEvent) => void;
  getNodeRef: (id: string) => HTMLElement | null;
  setNodeRef: (id: string, el: HTMLElement | null) => void;
  dimension: "x" | "y";
};

const createAnoDndContext = () =>
  React.createContext<AnoDndContextType | undefined>(undefined);
const AnoDndColContext = createAnoDndContext();
const AnoDndRowContext = createAnoDndContext();

type ColRow = { size: number; id: string };
type ClosestResult = { size: number; id: string; index: number };

/**
 * Finds the column/row closest to `pos`.
 *
 * @param i           The start index to search from.
 * @param pos         The position to find the closest column/row to.
 * @param items       Array of items (columns/rows), each having a 'size'.
 *
 * @returns An object containing `{ size, id, index }` for the closest item.
 */
function findClosestColOrRow(
  i: number,
  pos: number,
  items: ColRow[],
): ClosestResult {
  if (!items.length) {
    throw new Error("No items provided.");
  }

  // 2) Compute the offset to the *start* of item[i].
  //    aggregator will hold the left/top edge of the current item[i].
  //    We'll sum sizes up to i.
  let aggregator = 0;
  for (let j = 0; j < i; j++) {
    aggregator += items[j].size;
  }

  // 3) Calculate the initial "best" distance and item
  let bestIndex = i;
  let bestDist = Math.abs(pos - (aggregator + items[i].size / 2));
  let bestItem = items[i];

  // We'll keep separate aggregators for left and right searches.
  // aggregatorLeft = position of the start of the current "left" item,
  // aggregatorRight = position of the start of the current "right" item.
  let aggregatorLeft = aggregator;
  let aggregatorRight = aggregator;

  // Set up left/right indices
  let left = i - 1;
  let right = i + 1;

  // We'll expand in both directions until the distance doesn't get better.
  let searchLeft = true;
  let searchRight = true;

  while (searchLeft || searchRight) {
    // ---- Search Left ----
    if (searchLeft) {
      if (left < 0) {
        // No more items on the left
        searchLeft = false;
      } else {
        // Before computing the center for item at 'left',
        // adjust aggregatorLeft to the start of that item.
        aggregatorLeft -= items[left].size;
        const centerLeft = aggregatorLeft + items[left].size / 2;
        const distLeft = Math.abs(pos - centerLeft);

        if (distLeft < bestDist) {
          bestDist = distLeft;
          bestIndex = left;
          bestItem = items[left];
          left--;
        } else {
          // If we didn't improve, no point continuing left
          searchLeft = false;
        }
      }
    }

    // ---- Search Right ----
    if (searchRight) {
      if (right >= items.length) {
        // No more items on the right
        searchRight = false;
      } else {
        // aggregatorRight is currently at the start of item i (or last visited on the right).
        // Move it forward by the size of the item to the immediate left of `right`
        // so that aggregatorRight points to the start of items[right].
        aggregatorRight += items[right - 1]?.size ?? 0;
        const centerRight = aggregatorRight + items[right].size / 2;
        const distRight = Math.abs(pos - centerRight);

        if (distRight < bestDist) {
          bestDist = distRight;
          bestIndex = right;
          bestItem = items[right];
          right++;
        } else {
          // If we didn't improve, no point continuing right
          searchRight = false;
        }
      }
    }
  }

  return { ...bestItem, index: bestIndex };
}

type Delta = {
  mouseDelta: { x: number; y: number };
  scrollDelta: { x: number; y: number };
};
const initialDelta: Delta = {
  mouseDelta: { x: 0, y: 0 },
  scrollDelta: { x: 0, y: 0 },
};
const totalDelta = (delta: Delta, dimension: "x" | "y") =>
  delta.mouseDelta[dimension] + delta.scrollDelta[dimension];
type AnoDndEvent = {
  active: { id: string | number };
  over: { id: string | number } | null;
};
const AnoDndProvider = ({
  children,
  cols,
  scrollRef,
  onDragEnd,
  onDragStart,
  onDragCancel,
  AnoDndContext,
  dimension,
  getAverageSize,
}: {
  children: React.ReactNode;
  cols: { size: number; id: string }[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onDragEnd: (event: AnoDndEvent) => void;
  onDragStart: (event: AnoDndEvent) => void;
  onDragCancel: () => void;
  AnoDndContext: React.Context<AnoDndContextType | undefined>;
  dimension: "x" | "y";
  getAverageSize: () => number;
}) => {
  const [isDragging, setIsDragging] = useState<AnoDndActive | null>(null);
  const [delta, setDelta] = useState<Delta>(initialDelta);
  const [closestCol, setClosestCol] = useState<{
    size: number;
    id: string;
    index: number;
  } | null>(null);

  const _refs = {
    isDragging,
    delta,
    closestCol,
    onDragEnd,
    cols,
    onDragCancel,
    getAverageSize,
  };
  const refs = React.useRef(_refs);
  refs.current = _refs;

  const getClosestCol = (delta: Delta) => {
    if (!isDragging) {
      return null;
    }
    const cols = refs.current.cols;

    // let xAgg = 0;
    // for (let i = 0; i < cols.length; i++) {
    //   const col = cols[i];
    //   if (col.id === isDragging.id) {
    //     break;
    //   }
    //   xAgg += col.size;
    // }
    const pos =
      isDragging.start + totalDelta(delta, dimension) + isDragging.size / 2;

    // let dAgg = 0;
    // let distance = Infinity;
    // let closestCol: null | { size: number; id: string; index: number } = null;
    // for (let i = 0; i < cols.length; i++) {
    //   const col = cols[i];
    //   const center = dAgg + col.size / 2;

    //   const dist = Math.abs(pos - center);

    //   if (dist <= distance) {
    //     distance = dist;
    //     closestCol = { ...col, index: i };
    //   }
    //   dAgg += col.size;
    // }

    // 1) Estimate the initial index using averageSize
    let i = Math.floor(
      (isDragging.start + totalDelta(delta, dimension)) /
        refs.current.getAverageSize(),
    );
    // Clamp i to valid range
    i = Math.max(0, Math.min(i, cols.length - 1));

    return findClosestColOrRow(i, pos, cols);
    // return closestCol;
  };

  const getClosestColRef = React.useRef(getClosestCol);
  getClosestColRef.current = getClosestCol;

  React.useEffect(() => {
    if (!isDragging) {
      return;
    }

    const reset = () => {
      setIsDragging(null);
      setDelta(initialDelta);
      setClosestCol(null);
    };
    const mouseMove = (ev: MouseEvent) => {
      const newDelta: Delta = {
        ...refs.current.delta,
        mouseDelta: {
          x: ev.clientX - isDragging.mouseStart.x,
          y: ev.clientY - isDragging.mouseStart.y,
        },
      };
      const closestCol = getClosestColRef.current(newDelta);
      setDelta(newDelta);
      setClosestCol(closestCol);
    };
    const onScroll = () => {
      const el = scrollRef.current;
      if (!el) {
        throw new Error("No scrollEl");
      }
      const newDelta = {
        ...refs.current.delta,
        scrollDelta: {
          x: el.scrollLeft - isDragging.scrollStart.x,
          y: el.scrollTop - isDragging.scrollStart.y,
        },
      };
      const closestCol = getClosestColRef.current(newDelta);
      getClosestColRef.current(newDelta);
      setDelta(newDelta);
      setClosestCol(closestCol);
    };

    const onMouseUp = () => {
      refs.current.onDragEnd({
        active: { id: isDragging.id },
        over: refs.current.closestCol,
      });
      reset();
    };

    const cancel = () => {
      refs.current.onDragCancel();
      reset();
    };

    const keydown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        cancel();
      }
    };

    window.addEventListener("mousemove", mouseMove, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("mouseup", onMouseUp, true);
    window.addEventListener("keydown", keydown, true);
    return () => {
      window.removeEventListener("mousemove", mouseMove, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("mouseup", onMouseUp, true);
      window.removeEventListener("keydown", keydown, true);
    };
  }, [isDragging, scrollRef]);

  const nodeRef = React.useRef<Record<string, HTMLElement | null>>({});

  return (
    <AnoDndContext.Provider
      value={{
        setIsDragging,
        isDragging,
        delta,
        // cols,
        closestCol,
        scrollRef,
        onDragStart,
        dimension,
        setNodeRef(id, el) {
          nodeRef.current[id] = el;
          return () => {
            delete nodeRef.current[id];
          };
        },
        getNodeRef(id) {
          return nodeRef.current[id] ?? null;
        },
      }}
    >
      {children}
    </AnoDndContext.Provider>
  );
};

type AnoTransform = {
  [x: string]: number;
};

function useGetStyle(
  AnoDndContext: React.Context<AnoDndContextType | undefined>,
  id: string,
  thisIndex: number,
  start: number,
) {
  const ctx = React.useContext(AnoDndContext);
  if (!ctx) {
    throw new Error("useAnoDrag must be used within AnoDndProvider");
  }
  const dimension = ctx.dimension;
  const antiDimesion = dimension === "x" ? "y" : "x";

  const isDraggingThis = ctx.isDragging && ctx.isDragging.id === id;

  let transform: AnoTransform = { x: 0, y: 0 };
  if (isDraggingThis) {
    transform = {
      [dimension]: totalDelta(ctx.delta, dimension),
      [antiDimesion]: 0,
    };
  }

  let transition = "transform 200ms ease";

  const prevIndexRef = React.useRef(thisIndex);
  const updatedIndex = prevIndexRef.current !== thisIndex;
  const overrideRet = React.useRef<{
    transform: AnoTransform;
    transition: string;
  } | null>(null);

  if (ctx.closestCol && ctx.isDragging && !isDraggingThis) {
    if (thisIndex > ctx.isDragging.index && thisIndex <= ctx.closestCol.index) {
      transform = { [dimension]: -1 * ctx.isDragging.size, [antiDimesion]: 0 };
    } else if (
      thisIndex < ctx.isDragging.index &&
      thisIndex >= ctx.closestCol.index
    ) {
      transform = { [dimension]: ctx.isDragging.size, [antiDimesion]: 0 };
    }
  }

  if (isDraggingThis) {
    transition = "none";
  }

  // if (!ctx.isDragging) {
  //   transition = "none";
  // }

  //#region handle-drop-animation
  const prevTransformRef = React.useRef(transform);
  const prevTransform = prevTransformRef.current;

  const prevDRef = React.useRef(start);
  const prevD = prevDRef.current;

  if (updatedIndex) {
    const totalPreviousD = prevD + prevTransform[dimension];
    const newTransformD = totalPreviousD - start;
    // console.log(
    //   `Updating index from ${prevIndexRef.current} to ${thisIndex} and x from ${prevX} to ${thisX} and transform from ${prevTransform.x} to ${transform.x}. New transform x: ${newTransformX}`,
    // );
    overrideRet.current = {
      transform: { ...transform, [dimension]: newTransformD },
      transition: "none",
    };
  }

  const rerender = React.useReducer(() => ({}), {})[1];

  React.useEffect(() => {
    const t = requestAnimationFrame(() => {
      if (overrideRet.current?.transition === "none") {
        overrideRet.current.transition = "transform 200ms ease";
        overrideRet.current.transform[dimension] = 0;
        rerender();
      } else if (overrideRet.current?.transition === "transform 200ms ease") {
        overrideRet.current = null;
        rerender();
      }
    });
    return () => {
      cancelAnimationFrame(t);
    };
  });

  prevIndexRef.current = thisIndex;
  prevTransformRef.current = transform;
  prevDRef.current = start;
  //#endregion

  const ret = overrideRet.current ?? { transform, transition };

  // if (dimension === "y" && ret.transform.y !== 0) {
  //   console.log("transform.y", overrideRet.current);
  // }

  return ret;
}

const useAnoDrag = (
  AnoDndContext: React.Context<AnoDndContextType | undefined>,
  id: string,
  size: number,
  thisIndex: number,
  start: number,
) => {
  const ctx = React.useContext(AnoDndContext);
  if (!ctx) {
    throw new Error("useAnoDrag must be used within AnoDndProvider");
  }

  const isDraggingThis = ctx.isDragging && ctx.isDragging.id === id;

  const { transition, transform } = useGetStyle(
    AnoDndContext,
    id,
    thisIndex,
    start,
  );

  return {
    transform,
    transition,
    isDragging: isDraggingThis,
    listeners: {
      onMouseDown: (ev: React.MouseEvent) => {
        const rect = ctx.getNodeRef(id)?.getBoundingClientRect();
        if (!rect) {
          throw new Error("No rect");
        }
        const scrollEl = ctx.scrollRef.current;
        if (!scrollEl) {
          throw new Error("No scrollEl");
        }
        ctx.onDragStart({
          active: { id },
          over: null,
        });
        ctx.setIsDragging({
          id,
          mouseStart: { x: ev.clientX, y: ev.clientY },
          handleOffset: {
            x: ev.clientX - rect.left,
            y: ev.clientY - rect.top,
          },
          scrollStart: {
            x: scrollEl.scrollLeft,
            y: scrollEl.scrollTop,
          },
          size: size,
          index: thisIndex,
          start,
        });
      },
    },
    setNodeRef: (el: HTMLElement | null) => {
      ctx.setNodeRef(id, el);
    },
    attributes: {},
  };
};

const DragAlongCell = React.memo(function DragAlongCell({
  cell,
}: {
  cell: Cell<User, unknown>;
}) {
  // const {
  //   isDragging,
  //   setNodeRef,
  //   transform: _transform,
  //   transition,
  // } = useSortable({
  //   id: cell.column.id,
  //   data: {
  //     type: "col",
  //   },
  // });

  const {
    isDragging,
    setNodeRef,
    transform: _transform,
    transition,
  } = useAnoDrag(
    AnoDndColContext,
    cell.column.id,
    cell.column.getSize(),
    cell.column.getIndex(),
    cell.column.getStart(),
  );

  // const transform: Transform | null = _transform
  //   ? { ..._transform, y: 0 }
  //   : null;

  const dragTransform = _transform ? ` + ${_transform.x}px` : "";

  const transform = cell.column.getIsPinned()
    ? "none"
    : // : `translate3d(calc(var(--virtual-padding-left, 0) * 1px${dragTransform}), 0, 0)`;
      `translate3d(calc(0px${dragTransform}), 0, 0)`;

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
  // for (let i = 0; i < 1e4; i += 1) {
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
          position: "absolute",
          left: cell.column.getStart(),
        },
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </div>
  );
});

function App() {
  const [data, setData] = React.useState<User[]>(() => generateTableData(1e5));
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
  const rowIds = React.useMemo(() => {
    return rows.map((row) => row.id);
  }, [rows]);

  // reorder columns after drag & drop
  function handleColDragEnd(event: AnoDndEvent) {
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

  function handleRowDragEnd(event: AnoDndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = rowIds.indexOf(String(active.id));
        const newIndex = rowIds.indexOf(String(over.id));
        return arrayMove(data, oldIndex, newIndex); //this is just a splice util
      });
    }
  }

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
  const baseColVirtOpts = React.useCallback(
    (
      headerIndex: number,
    ): Pick<
      VirtualizerOptions<HTMLDivElement, Element>,
      | "getScrollElement"
      | "horizontal"
      | "overscan"
      | "rangeExtractor"
      | "debug"
    > => {
      const headers = table.getHeaderGroups()[headerIndex].headers;
      return {
        getScrollElement: () => tableContainerRef.current,
        horizontal: true,
        // debug: true,
        overscan: 1, //how many columns to render on each side off screen each way (adjust this for performance)
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
                visibleColsOutsideVirtualRange.current[headerIndex].delete(
                  index,
                );
              }
            }
          });
          unpinnedHeaders.forEach((col) => {
            const index = col.index;
            if (index === draggedIndex) {
              return;
            }
            if (
              visibleColsOutsideVirtualRange.current[headerIndex].has(index)
            ) {
              visibleColsOutsideVirtualRange.current[headerIndex].delete(index);
            }
          });
          // console.log(
          //   "range",
          //   draggedIndex,
          //   [...next].sort((a, b) => a - b),
          // );
          return [...next].sort((a, b) => a - b);
        },
      };
    },
    [table],
  );

  const headerGroups = table.getHeaderGroups();
  const rerender = React.useReducer(() => ({}), {})[1];

  const updateAllDraggedIndexes = (val: number | null) => {
    headerGroups.forEach((_, headerIndex) => {
      updateDraggedIndex(headerIndex, val);
    });
  };

  const headerColVirtualizerOptions = React.useMemo(() => {
    return headerGroups.map(
      (
        headerGroup,
        headerIndex,
      ): VirtualizerOptions<HTMLDivElement, Element> => {
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
  }, [baseColVirtOpts, headerGroups, rerender]);

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

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => tableRowHeight,
    getScrollElement: () => tableContainerRef.current,
    overscan: 5,
    rangeExtractor: React.useCallback(
      (range: Range): number[] => {
        const next = new Set(defaultRangeExtractor(range));
        if (draggedRowRef.current !== null) {
          next.add(rowIds.indexOf(draggedRowRef.current));
        }
        const n = [...next].sort((a, b) => a - b);
        return n;
      },
      [rowIds],
    ),
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
      // const virtualColumnsStart = virtualColumns[0];
      // const virtualColumnsEnd = [...virtualColumns].reverse()[0];

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
    <AnoDndProvider
      cols={React.useMemo(() => {
        return allCols.map((col) => {
          return { id: col.id, size: col.getSize() };
        });
      }, [allCols])}
      getAverageSize={() => averageColSize}
      dimension="x"
      scrollRef={tableContainerRef}
      onDragEnd={(ev) => {
        handleColDragEnd(ev);
        updateAllDraggedIndexes(null);
      }}
      onDragCancel={() => {
        updateAllDraggedIndexes(null);
        setIsDragging(false);
      }}
      onDragStart={(ev) => {
        setIsDragging(true);
        const id = ev.active.id;
        if (id && typeof id === "string") {
          headerGroups.forEach((headerGroup, headerIndex) => {
            const col = headerGroup.headers.findIndex(
              (header) => header.id === id,
            );
            if (col !== -1) {
              updateDraggedIndex(headerIndex, col);
            }
          });
        }
      }}
      AnoDndContext={AnoDndColContext}
    >
      <AnoDndProvider
        dimension="y"
        getAverageSize={() => tableRowHeight}
        AnoDndContext={AnoDndRowContext}
        scrollRef={tableContainerRef}
        onDragEnd={(ev) => {
          handleRowDragEnd(ev);
          draggedRowRef.current = null;
        }}
        onDragCancel={() => {
          draggedRowRef.current = null;
        }}
        onDragStart={(ev) => {
          const id = ev.active.id;
          if (id && typeof id === "string") {
            draggedRowRef.current = id;
          }
        }}
        cols={rowIds.map((id) => {
          return { id, size: tableRowHeight };
        })}
      >
        <div
          ref={tableContainerRef}
          style={{
            overflow: "auto",
            width: "1920px",
            height: "1200px",
            position: "relative",
            contain: "paint",
            willChange: "transform",
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
              const {
                virtualPaddingLeft,
                virtualPaddingRight,
                virtualColumns,
              } = getVirtualCols(headerIndex);
              return (
                <div
                  key={headerGroup.id}
                  {...{
                    className: "tr",
                  }}
                  style={{
                    display: "flex",
                    height: tableRowHeight,
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
                    <>
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
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <TableBody
            virtualColumns={bodyCols}
            virtualRows={virtualRows}
            rows={rows}
          ></TableBody>
        </div>
      </AnoDndProvider>
    </AnoDndProvider>
  );
}

function tuple<A, B, C, D>(a: A, b: B, c: C, d: D): [A, B, C, D];
function tuple<A, B, C>(a: A, b: B, c: C): [A, B, C];
function tuple<A, B>(a: A, b: B): [A, B];
function tuple(...args: any[]) {
  return args;
}

const initial = Symbol();
const useDebugDeps = (...deps: unknown[]) => {
  const previousDeps = React.useRef<unknown[]>(deps.map(() => initial));
  const diffingDeps: unknown[] = [];
  deps.forEach((dep, index) => {
    const prev = previousDeps.current[index];
    if (prev === initial) {
      diffingDeps.push(tuple("initial_render", index, dep));
    } else if (prev !== dep) {
      diffingDeps.push(tuple(index, prev, dep));
    }
  });
  previousDeps.current = deps;
  return diffingDeps;
};

const TableBody = ({
  virtualColumns,
  virtualRows,
  rows,
}: {
  virtualColumns: VirtualItem[];
  virtualRows: VirtualItem[];
  rows: Row<User>[];
}) => {
  return (
    <div
      className="tbody"
      style={{
        // maxWidth: table.getTotalSize(),
        position: "relative",
        // transform: `translate3d(0, calc(var(--virtual-offset-top, 0) * 1px), 0)`,
        // top: virtualRows[0].start,
      }}
    >
      {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index];

        return (
          <TableRow
            key={row.id}
            row={row}
            virtualOffsetTop={virtualRow.start}
            virtualColumns={virtualColumns}
          />
        );
      })}
    </div>
  );
};

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

const TableRow = React.memo(function TableRow({
  row,
  virtualOffsetTop,
  virtualColumns,
}: {
  row: Row<User>;
  virtualOffsetTop: number;
  virtualColumns: VirtualItem[];
}) {
  const visibileCells = row.getVisibleCells();

  const { transform, transition, setNodeRef, isDragging } = useAnoDrag(
    AnoDndRowContext,
    row.id,
    tableRowHeight,
    row.index,
    row.index * tableRowHeight,
  );

  // console.log("@transform?.y ?? 0", transform?.y ?? 0);

  return (
    <div
      style={{
        position: "absolute",
        // transform: `translate3d(calc(var(--virtual-padding-left, 0) * 1px), ${virtualRow.start}px, 0)`,
        // transform: `translate3d(0, ${virtualOffsetTop}px, 0)`,
        // transform: transform
        //   ? CSS.Transform.toString(transform)
        //   : `translate3d(0, ${virtualOffsetTop}px, 0)`,
        transform: `translate3d(0, ${transform?.y ?? 0}px, 0)`,
        top: virtualOffsetTop,
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
          return <DragAlongCell key={cell.id} cell={cell} />;
        })}
    </div>
  );
});

const IndeterminateCheckbox = React.memo(function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}: { indeterminate?: boolean } & React.HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!);

  React.useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
      {...rest}
    />
  );
});

export default App;
