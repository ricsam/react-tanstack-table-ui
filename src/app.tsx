import {
  Cell,
  Column,
  ColumnDef,
  ColumnOrderState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  Header,
  Row,
  RowSelectionState,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import React, { CSSProperties, useState } from "react";
import "./App.css";
import { generateTableData, User } from "./generate_table_data";

import { arrayMove } from "@dnd-kit/sortable";
import { flushSync } from "react-dom";
import { calculateDisplacement } from "./calculate_displacement";
import {
  calculateDisplacements as calculateDisplacement2,
  findDeltaAtPosition,
} from "./Item";
import {
  defaultRangeExtractor,
  elementScroll,
  measureElement,
  memo,
  observeElementOffset,
  observeElementRect,
  Range,
  useVirtualizer,
  VirtualItem,
  Virtualizer,
  VirtualizerOptions,
} from "./react-virtual";
import { findClosestColOrRow } from "./find_closest_col_or_row";

let prevLog: any = null;
const logDiff = (...values: any[]) => {
  if (prevLog === values.join(", ")) {
    return;
  }
  prevLog = values.join(", ");
  console.log(...values);
};

const RowDragHandleCell = ({
  rowId,
  rowIndex,
  table,
}: {
  rowId: string;
  rowIndex: number;
  table: Table<User>;
}) => {
  const { attributes, listeners, hidden } = useAnoDrag(
    AnoDndRowContext,
    rowId,
    rowIndex,
  );
  return (
    // Alternatively, you could set these attributes on the rows themselves
    <button
      {...attributes}
      {...listeners}
      style={{ display: hidden ? "none" : "inline" }}
    >
      🟰
    </button>
  );
};

const tableRowHeight = 32;

const columnHelper = createColumnHelper<User>();

const columns: ColumnDef<User, any>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <button
          {...{
            onClick: row.getToggleExpandedHandler(),
            style: { cursor: "pointer" },
          }}
        >
          {row.getIsExpanded() ? "👇" : "👉"}
        </button>
      ) : (
        "🔵"
      );
    },
  },
  {
    id: "select",
    header: ({ table }) => (
      <IndeterminateCheckbox
        {...{
          checked: table.getIsAllRowsSelected(),
          indeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler(),
        }}
      />
    ),
    cell: ({ row }) => (
      <div className="px-1">
        <IndeterminateCheckbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
          }}
        />
      </div>
    ),
  },
  {
    id: "drag-handle",
    header: "Move",
    cell: ({ row, table }) => (
      <RowDragHandleCell rowId={row.id} rowIndex={row.index} table={table} />
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
  } = useAnoDrag(AnoDndColContext, header.column.id, header.column.getIndex());

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
    // width: `calc(var(--header-${header?.id}-size) * 1px)`,
    width: header.getSize(),
    left: header.column.getStart(),
    position: "absolute",
  };

  return (
    <div key={header.id} ref={setNodeRef} className="th" style={style}>
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
  index: number;
};

type AnoDndContextType = {
  setIsDragging: React.Dispatch<React.SetStateAction<AnoDndActive | null>>;
  isDragging: AnoDndActive | null;
  delta: Delta;
  // cols: { size: number; id: string }[];
  closestCol: { id: string; index: number } | null;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onDragStart: (event: AnoDndEvent) => void;
  getNodeRef: (id: string) => HTMLElement | null;
  setNodeRef: (id: string, el: HTMLElement | null) => void;
  dimension: "x" | "y";
  selected?: AnoDndSelected;
  getRenderedRange: () => string[];
  getSize: (id: string) => number;
  getStart: (id: string) => number;
  displacements: (
    delta: number,
    draggedId: string,
  ) => {
    displacements: Record<string, number>;
    newItemIndices: Record<string, number>;
    displacedDisplayedRange: Set<string>;
  };
};

const createAnoDndContext = () =>
  React.createContext<AnoDndContextType | undefined>(undefined);
const AnoDndColContext = createAnoDndContext();
const AnoDndRowContext = createAnoDndContext();

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
  active: { id: string };
  over: { id: string } | null;
};

const checkAdjacentForOverlap = (
  items: { id: string }[],
  bestIndex: number,
  dragStart: number,
  dragEnd: number,
  getSize: (id: string) => number,
  getStart: (id: string) => number,
) => {
  const checkOverlapping = (index: number) => {
    if (!items[index]) {
      return 0;
    }
    const itemStart = getStart(items[index].id);
    const itemSize = getSize(items[index].id);
    const itemEnd = itemStart + itemSize;

    const overlapStart = Math.max(dragStart, itemStart);
    const overlapEnd = Math.min(dragEnd, itemEnd);
    const overlapSize = Math.max(0, overlapEnd - overlapStart);

    // Fraction of the *candidate item* that is overlapped
    const overlapFraction = overlapSize / itemSize;

    return overlapFraction;
  };

  // we are not moving
  // check if adjacent items are overlapping
  let bestOverlap = 0;
  for (const index of [bestIndex - 1, bestIndex + 1]) {
    const overlap = checkOverlapping(index);
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      if (overlap > 0.5) {
        return { id: items[index].id, index };
      }
    } else {
      continue;
    }
  }
  return null;
};

type AnoDndSelected = {
  state: RowSelectionState;
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
  selected,
  getRenderedRange,
  getSize,
  getStart,
  getVirtualItemForOffset,
  displacements,
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
  selected?: AnoDndSelected;
  getRenderedRange: () => string[];
  getSize: (id: string) => number;
  getStart: (id: string) => number;
  getVirtualItemForOffset: (offset: number) => VirtualItem | undefined;
  displacements: {
    calculateDisplacements: (
      delta: number,
      draggedId: string,
    ) => {
      displacements: Record<string, number>;
      newItemIndices: Record<string, number>;
      displacedDisplayedRange: Set<string>;
    };
    findDeltaAtPosition: (
      estimatedDelta: number,
      position: number,
      draggedId: string,
    ) => number;
  };
}) => {
  const [isDragging, setIsDragging] = useState<AnoDndActive | null>(null);
  const [delta, setDelta] = useState<Delta>(initialDelta);
  const [closestCol, setClosestCol] = useState<{
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
    getVirtualItemForOffset,
    displacements,
  };
  const refs = React.useRef(_refs);
  refs.current = _refs;

  /**
   * get the closest col to the dragged col
   */
  const getClosestCol = (
    delta: Delta,
    dragged: { id: string; index: number },
  ) => {
    const cols = refs.current.cols;

    let d = totalDelta(delta, dimension);

    if (d < 0) {
    } else {
      // d +=
      //   getSize(dragged.id) / 2 -
      //   (refs.current.isDragging?.handleOffset[dimension] ?? 0);
    }

    const pos =
      getStart(dragged.id) +
      // (refs.current.isDragging?.handleOffset[dimension] ?? 0) +
      d +
      getSize(dragged.id) / 2;

    // const virtualItem = getVirtualItemForOffset(pos + getSize(dragged.id) / 2);
    let virtualItem = getVirtualItemForOffset(pos);
    if (virtualItem && d >= 0) {
      // virtualItem = getVirtualItemForOffset(pos - virtualItem.size / 2);
    }
    if (virtualItem && d < 0) {
      // virtualItem = getVirtualItemForOffset(pos + virtualItem.size / 2);
    }

    // if (!virtualItem) {
    //   return null;
    // }
    // return { id: cols[virtualItem.index].id, index: virtualItem.index };

    // 1) Estimate the initial index using averageSize
    let poorEstimatedClosestIndex = Math.floor(
      (getStart(dragged.id) + d + (d >= 0 ? getSize(dragged.id) : 0)) /
        refs.current.getAverageSize(),
    );
    // Clamp i to valid range
    poorEstimatedClosestIndex = Math.max(
      0,
      Math.min(poorEstimatedClosestIndex, cols.length - 1),
    );

    const estimatedClosestIndex =
      virtualItem?.index ?? poorEstimatedClosestIndex;

    const estimatedDelta = estimatedClosestIndex - dragged.index;

    const locatedDelta = refs.current.displacements.findDeltaAtPosition(
      estimatedDelta,
      pos,
      dragged.id,
    );

    const closestIndex = Math.max(
      Math.min(dragged.index + locatedDelta, cols.length - 1),
      0,
    );

    return {
      id: cols[closestIndex].id,
      index: closestIndex,
    };

    let changed = true;
    let result = findClosestColOrRow(
      estimatedClosestIndex,
      pos,
      dragged.id,
      cols,
      getSize,
      getStart,
    );
    // let i = 0;
    // while (i < 1) {
    //   const indexDiff = result.index - dragged.index;
    //   const displacement = displacements(indexDiff, dragged.id);
    //   result = findClosestColOrRow(
    //     estimatedClosestIndex,
    //     pos,
    //     dragged.id,
    //     cols,
    //     getSize,
    //     getStart,
    //     displacement,
    //   );
    //   i++;
    // }
    return result;
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
      const closestCol = getClosestColRef.current(newDelta, isDragging);
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
      const closestCol = getClosestColRef.current(newDelta, isDragging);
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
        getSize,
        getRenderedRange,
        selected,
        getStart,
        displacements: displacements.calculateDisplacements,
      }}
    >
      {children}
    </AnoDndContext.Provider>
  );
};

type AnoTransform = {
  x?: number;
  y?: number;
};

function useGetStyle(
  ctx: AnoDndContextType,
  id: string,
  thisIndex: number,
  isDraggingThis: boolean,
) {
  const dimension = ctx.dimension;
  const antiDimesion = dimension === "x" ? "y" : "x";
  let hidden = false;

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
    const indexDiff = ctx.closestCol.index - ctx.isDragging.index;

    const getSingleTransform = (
      indexDiff: number,
      index: number,
      size: number,
    ) => {
      if (thisIndex > index && thisIndex <= index + indexDiff) {
        return -1 * size;
      } else if (thisIndex < index && thisIndex >= index + indexDiff) {
        return size;
      }
      return 0;
    };

    const d = totalDelta(ctx.delta, dimension);
    const delta = ctx.getStart(ctx.isDragging.id) + d;

    const displacements = ctx.displacements(indexDiff, ctx.isDragging.id);
    hidden = !displacements.displacedDisplayedRange.has(id);
    transform = {
      [dimension]: displacements.displacements[id],
      // ctx.selected && ctx.selected.state[ctx.isDragging.id]
      //   ? // ? ctx.selected.displacements(delta)[id]
      //   : getSingleTransform(
      //       indexDiff,
      //       ctx.isDragging.index,
      //       ctx.getSize(ctx.isDragging.id),
      //     ),
      [antiDimesion]: 0,
    };
  }

  if (isDraggingThis) {
    transition = "none";
  }

  //#region handle-drop-animation
  const prevTransformRef = React.useRef(transform);
  const prevTransform = prevTransformRef.current;

  const start = ctx.getStart(id);

  const prevStartRef = React.useRef(start);
  const prevStart = prevStartRef.current;

  const prevId = React.useRef(id);

  if (updatedIndex) {
    const totalPreviousD = prevStart + (prevTransform[dimension] ?? 0);
    const newTransformD = totalPreviousD - start;
    // console.log(
    //   `Updating index from ${prevIndexRef.current} to ${thisIndex} and start from ${prevStart} to ${start} and transform from ${prevTransform.x} to ${transform.x}. New transform: ${newTransformD}. New id: ${prevId.current} to ${id}`,
    // );
    overrideRet.current = {
      transform: { ...transform, [dimension]: newTransformD },
      transition: "none",
    };
  }
  // if (id === "2") {
  //   console.log("start for id 2", start);
  // }

  const rerender = React.useReducer(() => ({}), {})[1];

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (overrideRet.current?.transition === "none") {
        overrideRet.current.transition = "transform 200ms ease";
        overrideRet.current.transform[dimension] = 0;
        flushSync(rerender);
      } else if (overrideRet.current?.transition === "transform 200ms ease") {
        overrideRet.current = null;
        flushSync(rerender);
      }
    }, 200);
    return () => {
      clearTimeout(t);
    };
  });

  prevIndexRef.current = thisIndex;
  prevTransformRef.current = transform;
  prevStartRef.current = start;
  //#endregion

  const ret = overrideRet.current ?? { transform, transition };

  // if (dimension === "y" && ret.transform.y !== 0) {
  //   console.log("transform.y", overrideRet.current);
  // }

  return { ...ret, hidden };
}

const useAnoDrag = (
  AnoDndContext: React.Context<AnoDndContextType | undefined>,
  id: string,
  thisIndex: number,
) => {
  const ctx = React.useContext(AnoDndContext);
  if (!ctx) {
    throw new Error("useAnoDrag must be used within AnoDndProvider");
  }

  const isDragHandle = Boolean(ctx.isDragging && ctx.isDragging.id === id);

  let isDraggingThis = isDragHandle;

  if (!isDraggingThis && ctx.selected && ctx.isDragging) {
    const selected = ctx.selected;
    if (selected.state[ctx.isDragging.id]) {
      isDraggingThis = Boolean(selected.state[id]);
    }
  }

  const { transition, transform, hidden } = useGetStyle(
    ctx,
    id,
    thisIndex,
    false,
  );
  if (isDraggingThis) {
    // logDiff(id, thisIndex, transform);
  }

  // const dragHandleStyle = useGetStyle(
  //   ctx,
  //   id,
  //   thisIndex,
  //   true,
  // );

  return {
    transform,
    transition,
    isDragging: isDraggingThis,
    isDragHandle,
    hidden,
    // dragHandleStyle,
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
          index: thisIndex,
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
  } = useAnoDrag(AnoDndColContext, cell.column.id, cell.column.getIndex());

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
    // transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transform,
    transition,
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
    height: tableRowHeight,
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
          // width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
          width: cell.column.getSize(),
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          position: "absolute",
          left: cell.column.getStart(),
          zIndex: isDragging ? 5 : 0,
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
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  });
  const columnSizeVars = React.useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      // colSizes[`--header-${header.id}-size`] = header.getSize();
      // colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
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
        const oldIndex = columnOrder.indexOf(active.id);
        const newIndex = columnOrder.indexOf(over.id);
        return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
      });
    }
  }

  function handleRowDragEnd(event: AnoDndEvent) {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    setData((oldData) => {
      const oldRow = table.getRow(active.id);
      const newRow = table.getRow(over.id);

      if (!oldRow || !newRow) {
        return oldData;
      }

      const oldIndex = oldRow.index;
      const newIndex = newRow.index;

      const selection = table.getState().rowSelection;
      // The difference in positions for the "active" row
      const delta = newIndex - oldIndex;

      // If the dragged row is not selected, just move that single row
      if (!selection[active.id]) {
        const newData = [...oldData];
        // Remove the dragged row
        const [removed] = newData.splice(oldIndex, 1);
        // Insert at the drop position
        newData.splice(newIndex, 0, removed);
        return newData;
      }

      // Otherwise, move ALL selected rows by the same delta
      const selectedIndexes = table
        .getSelectedRowModel()
        .rows.map((row) => row.index);

      // Make a working copy of the data
      const newData = [...oldData];

      // 1) Remove the selected rows from newData.
      //    - Remove from the highest index to the lowest so we don't invalidate
      //      the smaller indexes as we splice.
      for (let i = selectedIndexes.length - 1; i >= 0; i--) {
        newData.splice(selectedIndexes[i], 1);
      }

      // 2) Re-insert the selected rows at their new positions, preserving
      //    relative order of the selection.
      //    - We'll do it in ascending order of their *original* indexes.
      selectedIndexes.forEach((originalIndex) => {
        let targetIndex = originalIndex + delta;
        // Optionally clamp (so we don't go out of bounds):
        if (targetIndex < 0) targetIndex = 0;
        if (targetIndex > newData.length) {
          targetIndex = newData.length;
        }

        // The row we want to re-insert is still in the oldData
        // at `originalIndex`.
        const rowToInsert = oldData[originalIndex];

        // Insert it into the newData
        newData.splice(targetIndex, 0, rowToInsert);
      });

      return newData;
    });
  }

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
          const defaultRange = defaultRangeExtractor(range);
          const next = new Set(defaultRange);

          const defaultRangeSet = new Set(defaultRange);

          defaultColWindowRef.current = [...defaultRangeSet].sort(
            (a, b) => a - b,
          );

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

  headerColVirtualizers[
    headerColVirtualizers.length - 1
  ].shouldAdjustScrollPositionOnItemSizeChange =
    // when moving columns we want to adjust the scroll position
    // when resizing columns we don't want to adjust the scroll position
    table.getState().columnSizingInfo.isResizingColumn === false
      ? (item, delta, instance) => {
          return true;
        }
      : undefined;

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

  // const draggedRowRef = React.useRef<string | null>(null);
  const [draggedRowId, setDraggedRowId] = React.useState<string | null>(null);

  const _refs = { table, rowIds };
  const refs = React.useRef(_refs);
  refs.current = _refs;

  const defaultRowWindowRef = React.useRef<number[] | null>(null);
  const defaultColWindowRef = React.useRef<number[] | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: React.useCallback(() => tableRowHeight, []),
    getItemKey: React.useCallback((index: number) => rowIds[index], [rowIds]),
    getScrollElement: () => tableContainerRef.current,
    measureElement: React.useCallback(
      (
        element: any,
        entry: ResizeObserverEntry | undefined,
        instance: Virtualizer<HTMLDivElement, any>,
      ) => {
        const defaultSize = measureElement(element, entry, instance);
        return Math.max(defaultSize, tableRowHeight);
      },
      [],
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
          const draggedIndex = draggedRow.index;

          // Add the dragged row index to the virtualized range
          next.add(draggedIndex);

          // Check if the dragged row is part of the current selection
          if (table.getState().rowSelection[draggedRowId]) {
            // If selected, include all selected rows in the virtualized range
            // @slow
            table.getSelectedRowModel().rows.forEach((r) => {
              next.add(r.index); // Add selected row indices
              draggedHeight +=
                instance.measurementsCache[r.index].size ?? tableRowHeight; // Accumulate their heights
            });
          } else {
            // If not selected, only consider the dragged row's height
            draggedHeight +=
              instance.measurementsCache[draggedIndex].size ?? tableRowHeight;
          }
        }

        // Calculate the number of additional rows needed to cover the screen
        const rowsToAdd = Math.floor(draggedHeight / tableRowHeight);
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
      [rows.length, draggedRowId],
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
        draggedRowId ? row.index !== rowIds.indexOf(draggedRowId) : true,
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
      /* eslint-disable react-hooks/exhaustive-deps */
      getVirtualItemForOffset={(offset) => {
        return headerColVirtualizers[
          headerColVirtualizers.length - 1
        ].getVirtualItemForOffset(offset);
      }}
      getRenderedRange={React.useCallback(
        () =>
          bodyCols.map(
            (vc) => headerGroups[headerGroups.length - 1].headers[vc.index].id,
          ),
        [bodyCols, headerGroups],
      )}
      cols={React.useMemo(() => {
        return allCols.map((col) => {
          return { id: col.id, size: col.getSize() };
        });
      }, [
        allCols,
        table.getState().columnSizingInfo,
        table.getState().columnSizing,
        columnOrder,
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
          columnOrder,
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
          columnOrder,
        ],
      )}
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
      displacements={React.useMemo(() => {
        const r = bodyCols.map((vc) => ({
          id: headerGroups[headerGroups.length - 1].headers[vc.index].id,
          index: vc.index,
          size: vc.size,
          start: vc.start,
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
              (end?.start ?? r.length - 1) + (end?.size ?? tableRowHeight),
            ],
          };
        };
        let range = getRange([0, r.length - 1]);

        if (defaultColWindowRef.current) {
          const currentWindow = defaultColWindowRef.current;
          range = getRange([
            rows[currentWindow[0]].index,
            rows[currentWindow[currentWindow.length - 1]].index,
          ]);
        }

        return {
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
            draggedId: string,
          ) {
            const sel = r.filter((r) => r.id === draggedId);
            return findDeltaAtPosition({
              lastIndex: rows.length - 1,
              draggedId,
              inRangeItems: r.filter(
                (r) => r.index >= range.index[0] && r.index <= range.index[1],
              ),
              selectedItems: sel,
              cursorPosition: position,
              estimatedDelta,
            });
          },
        };
      }, [bodyCols, headerGroups])}
    >
      <AnoDndProvider
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
                (end?.start ?? r.length - 1) + (end?.size ?? tableRowHeight),
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
              draggedId: string,
            ) {
              const sel =
                table.getIsSomeRowsSelected() && selected[draggedId]
                  ? r.filter((r) => selected[r.id])
                  : r.filter((r) => r.id === draggedId);
              return findDeltaAtPosition({
                lastIndex: rows.length - 1,
                draggedId,
                inRangeItems: r.filter(
                  (r) => r.index >= range.index[0] && r.index <= range.index[1],
                ),
                selectedItems: sel,
                cursorPosition: position,
                estimatedDelta,
              });
            },
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
            const size = rowVirtualizer.measurementsCache[row.index].size;
            return size ?? tableRowHeight;
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
              rowVirtualizer.measurementsCache[row.index].start ??
              estimateStart(row.index)
            );
          },
          [rowVirtualizer.measurementsCache, table],
        )}
        getAverageSize={() => tableRowHeight}
        AnoDndContext={AnoDndRowContext}
        scrollRef={tableContainerRef}
        onDragEnd={(ev) => {
          handleRowDragEnd(ev);
          setDraggedRowId(null);
        }}
        onDragCancel={() => {
          setDraggedRowId(null);
        }}
        onDragStart={(ev) => {
          const id = ev.active.id;
          if (id && typeof id === "string") {
            setDraggedRowId(id);
          }
        }}
        cols={rowIds.map((id) => {
          return { id, size: tableRowHeight };
        })}
        /* eslint-enable react-hooks/exhaustive-deps */
      >
        <div
          ref={tableContainerRef}
          style={{
            overflow: "auto",
            width: "1920px",
            height: "1600px",
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
            measureElement={rowVirtualizer.measureElement}
            width={table.getTotalSize()}
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
  measureElement,
  width,
}: {
  virtualColumns: VirtualItem[];
  virtualRows: VirtualItem[];
  rows: Row<User>[];
  measureElement: (el?: HTMLElement | null) => void;
  width: number;
}) => {
  return (
    <div
      className="tbody"
      style={{
        // maxWidth: table.getTotalSize(),
        position: "relative",
        // transform: `translate3d(0, calc(var(--virtual-offset-top, 0) * 1px), 0)`,
        // top: virtualRows[0].start,
        width,
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
            measureElement={measureElement}
            width={width}
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
          // width: `calc(var(--header-${header?.id}-size) * 1px)`,
          width: header.getSize(),
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
  measureElement,
  width,
}: {
  row: Row<User>;
  virtualOffsetTop: number;
  virtualColumns: VirtualItem[];
  measureElement: (el?: HTMLElement | null) => void;
  width: number;
}) {
  const visibileCells = row.getVisibleCells();

  const { transform, transition, setNodeRef, isDragging, hidden } = useAnoDrag(
    AnoDndRowContext,
    row.id,
    row.index,
  );

  // console.log("@transform?.y ?? 0", transform?.y ?? 0);

  const style: CSSProperties = {
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
    width,
    backgroundColor: "black",
    display: hidden ? "none" : "block",
  };
  // if (hidden) {
  //   console.log("hidden");
  // }

  return (
    <>
      <div
        style={{
          ...style,
        }}
        data-index={row.index}
        ref={(el) => {
          setNodeRef(el);
          measureElement(el);
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            width,
            height: tableRowHeight,
          }}
        >
          {virtualColumns
            .map((virtualColumn) => visibileCells[virtualColumn.index])
            .map((cell) => {
              return <DragAlongCell key={cell.id} cell={cell} />;
            })}
        </div>
        <div>
          {row.getIsExpanded() && <div>{renderSubComponent({ row })}</div>}
        </div>
      </div>
    </>
  );
});

const renderSubComponent = ({ row }: { row: Row<User> }) => {
  return (
    <pre style={{ fontSize: "10px", textAlign: "left" }}>
      <code>{JSON.stringify(row.original, null, 2)}</code>
    </pre>
  );
};

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
