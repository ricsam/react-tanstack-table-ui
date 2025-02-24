import {
  Cell,
  Column,
  ColumnDef,
  ColumnOrderState,
  ColumnPinningPosition,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  Header,
  HeaderGroup,
  Row,
  RowSelectionState,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import React, { CSSProperties, useState } from "react";
import "./app.css";
import { generateTableData, User } from "./generate_table_data";

import { arrayMove } from "@dnd-kit/sortable";
import { flushSync } from "react-dom";
import { calculateDisplacement } from "./calculate_displacement";
import {
  calculateDisplacements as calculateDisplacement2,
  findDeltaAtPosition,
  Item,
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
import { move, VirtualizedWindow, Item as MoveItem, PinPos } from "./move";
import { VirtualizedTable } from "./table/table";
import { useDrag } from "./table/use_drag";
import { DndRowContext } from "./table/dnd_provider";
import { iterateOverColumns } from "./table/iterate_over_columns";
import { useBigTable } from "./tests_data/use_big_table";
import { useSmallTable } from "./tests_data/use_small_table";

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
  const { attributes, listeners, hidden } = useDrag(
    DndRowContext,
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

const DraggableTableHeader = ({
  header,
  table,
  start,
  offsetLeft,
  defToRender,
}: {
  header: Header<User, unknown>;
  table: Table<User>;
  start: number;
  offsetLeft: number;
  defToRender: "header" | "footer";
}) => {
  const {
    isDragging,
    transform,
    transition,
    isPinned,
    dragStyle,
    attributes,
    listeners,
    setNodeRef,
  } = useColAttrs({
    cell: header,
    start,
    offsetLeft,
  });

  // const {
  //   transform: _transform,
  //   isDragging,
  //   transition,
  //   setNodeRef,
  //   listeners,
  //   attributes,
  //   pinned,
  // } = useAnoDrag(AnoDndColContext, header.column.id, header.column.getIndex());

  // const dragTransform = _transform ? ` + ${_transform.x}px` : "";

  // const isPinned = pinned ?? header.column.getIsPinned();

  // const transform = isPinned
  //   ? "none"
  //   : `translate3d(calc(0px${dragTransform}), 0, 0)`;
  // : `translate3d(calc(var(--virtual-padding-left, 0) * 1px${dragTransform}), 0, 0)`;

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    // transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transform,
    transition,
    whiteSpace: "nowrap",
    zIndex: isDragging || isPinned ? 1 : 0,
    display: "flex",
    paddingRight: "8px",
    paddingLeft: "8px",
    overflow: "hidden",
    height: "32px",
    // ...getCommonPinningStyles(header.column),
    // width: `calc(var(--header-${header?.id}-size) * 1px)`,
    width: header.getSize(),
    // left: isPinned ? header.getStart("left") : start,
    // position: isPinned ? "sticky" : "absolute",
    backgroundColor: isPinned ? "black" : "transparent",
    ...dragStyle,
  };

  return (
    <div key={header.id} ref={setNodeRef} className="th" style={style}>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        {header.isPlaceholder
          ? null
          : flexRender(
              header.column.columnDef[defToRender],
              header.getContext(),
            )}
        <div style={{ width: "4px" }}></div>
      </div>
      {/* {header.subHeaders.length === 0 && ( */}
      <button {...attributes} {...listeners}>
        🟰
      </button>
      {/* )} */}
      {header.column.getCanPin() && (
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
    // left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    // right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
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
  /**
   * from the bounding rect, relative to the screen
   */
  itemPos: { x: number; y: number };
  mouseStart: { x: number; y: number };
  scrollStart: { x: number; y: number };
  handleOffset: { x: number; y: number };
  index: number;
  tablePos: { x: number; y: number };
} & (
  | {
      pinned: false;
    }
  | {
      pinned: "left" | "right";
      pinnedIndex: number;
    }
);

type AnoDndContextType = {
  setIsDragging: React.Dispatch<React.SetStateAction<AnoDndActive | null>>;
  isDragging: AnoDndActive | null;
  delta: Delta;
  // cols: { size: number; id: string }[];
  closestCol: {
    id: string;
    index: number; // non-pinned index
    pinned: ColumnPinningPosition;
  } | null;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onDragStart: (event: AnoDndEvent) => void;
  getNodeRef: (id: string) => HTMLElement | null;
  setNodeRef: (id: string, el: HTMLElement | null) => void;
  dimension: "x" | "y";
  selected?: AnoDndSelected;
  getRenderedRange: () => string[];
  getSize: (id: string) => number;
  getStart: (id: string) => number;
  table: Table<User>;
  getPinned: (id: string) =>
    | {
        pinned: false;
      }
    | {
        pinned: "left" | "right";
        pinnedIndex: number;
      };
  displacements: (
    delta: number,
    draggedId: string,
  ) => {
    displacements: Record<string, number>;
    newItemIndices: Record<string, number>;
    displacedDisplayedRange: Set<string>;
  };
  moveResult?: ReturnType<typeof move>;
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
  getPinned,
  table,
  v2,
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
  getPinned: (id: string) =>
    | {
        pinned: false;
      }
    | {
        pinned: "left" | "right";
        pinnedIndex: number;
      };
  getVirtualItemForOffset: (offset: number) => VirtualItem | undefined;
  table: Table<User>;
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
      dragged: AnoDndActive,
    ) => ReturnType<typeof findDeltaAtPosition>;
    pinnedLeft: Item[];
    pinnedRight: Item[];
  };
  v2: {
    window: VirtualizedWindow;
    selected: string[];
    items: MoveItem[];
  };
}) => {
  const [isDragging, setIsDragging] = useState<AnoDndActive | null>(null);
  const [delta, setDelta] = useState<Delta>(initialDelta);
  const [closestCol, setClosestCol] = useState<{
    id: string;
    /**
     * non pinned index
     */
    index: number;
    pinned: false | "left" | "right";
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
    dragged: AnoDndActive,
  ):
    | {
        id: string;
        index: number;
        pinned: "left" | "right";
        pinnedIndex: number;
      }
    | {
        id: string;
        index: number;
        pinned: false;
      } => {
    const cols = refs.current.cols;

    const d = totalDelta(delta, dimension);

    let pos = getStart(dragged.id) + d + getSize(dragged.id) / 2;

    if (getPinned(dragged.id).pinned) {
      // pretend we have already moved the item from its non-pinned position to the pinned position
      const absoluteToTable =
        getStart(dragged.id) -
        (scrollRef.current?.scrollLeft ?? 0) -
        table.getColumn(dragged.id)!.getStart("left");

      // we say that the position is as if it is pinned
      const pinnedPos =
        table.getColumn(dragged.id)!.getStart("left") +
        (scrollRef.current?.scrollLeft ?? 0);

      pos = pinnedPos + d + getSize(dragged.id) / 2;
      // console.log("@pinnedpos", {
      //   pos,
      // });
      // console.log("@absoluteToTable", absoluteToTable);
      // d -= absoluteToTable;
      // let pos = getStart(dragged.id) + d + getSize(dragged.id) / 2;
      // let pos = getStart(dragged.id) + d + getSize(dragged.id) / 2;
      // pos += getStart(dragged.id) - table.getColumn(dragged.id)!.getStart("left")
      // table.getColumn(dragged.id)!.getStart("left") +
      // (scrollRef.current?.scrollLeft ?? 0) +
      // d +
      // getSize(dragged.id) / 2 -
      // absoluteToTable;
    }

    const virtualItem = getVirtualItemForOffset(pos);

    let poorEstimatedClosestIndex = Math.floor(
      (getStart(dragged.id) + d + (d >= 0 ? getSize(dragged.id) : 0)) /
        refs.current.getAverageSize(),
    );

    poorEstimatedClosestIndex = Math.max(
      0,
      Math.min(poorEstimatedClosestIndex, cols.length - 1),
    );

    const estimatedClosestIndex =
      virtualItem?.index ?? poorEstimatedClosestIndex;

    const estimatedDelta = estimatedClosestIndex - dragged.index;

    /**
     * @TODO also add the ancestor scroll delta: https://github.com/clauderic/dnd-kit/blob/master/packages/core/src/utilities/scroll/getScrollableAncestors.ts#L11
     */
    const itemTablePos =
      dragged.itemPos[dimension] +
      delta.mouseDelta[dimension] -
      dragged.tablePos[dimension] +
      getSize(dragged.id) / 2;

    const locatedDelta = refs.current.displacements.findDeltaAtPosition(
      estimatedDelta,
      pos,
      dragged,
    );

    let distance = locatedDelta.distance;
    const draggedIndex = dragged.index;

    let pinned: ColumnPinningPosition = false;
    let pinnedIndex = 0;

    const loopPinned = (side: "left" | "right", items: Item[]) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemCenter = item.start + item.size / 2;
        const distanceToPinned = Math.abs(itemTablePos - itemCenter);
        if (distanceToPinned < distance) {
          distance = distanceToPinned;
          pinned = side;
          pinnedIndex = i;
        }
      }
    };

    loopPinned("left", displacements.pinnedLeft);
    loopPinned("right", displacements.pinnedRight);

    // moving to pinned position
    if (pinned) {
      const items =
        pinned === "left"
          ? refs.current.displacements.pinnedLeft
          : refs.current.displacements.pinnedRight;

      const result = {
        id: items[pinnedIndex].id,
        index: items[pinnedIndex].index,
        pinnedIndex,
        pinned,
      };
      return result;
    }

    // moving from pinned position
    if (dragged.pinned) {
      const closestIndex = Math.max(
        Math.min(draggedIndex + locatedDelta.delta, cols.length - 1),
        0,
      );
      const items =
        dragged.pinned === "left"
          ? refs.current.displacements.pinnedLeft
          : refs.current.displacements.pinnedRight;

      const id = cols[closestIndex].id;
      const indexDiff = closestIndex - draggedIndex;
      // console.log("@getclosestcol", {
      //   closestIndex,
      //   delta: locatedDelta.delta,
      //   draggedIndex,
      //   indexDiff,
      //   id,
      // });
      return {
        id,
        index: closestIndex,
        pinned: false as const,
      };
    }

    // moving in center
    const closestIndex = Math.max(
      Math.min(draggedIndex + locatedDelta.delta, cols.length - 1),
      0,
    );
    const result = {
      id: cols[closestIndex].id,
      index: closestIndex,
      pinned: false as const,
    };

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
      const mouseDelta = {
        x: ev.clientX - isDragging.mouseStart.x,
        y: ev.clientY - isDragging.mouseStart.y,
      };
      const newDelta: Delta = {
        ...refs.current.delta,
        mouseDelta,
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

  const moveResult = isDragging
    ? move({
        items: v2.items,
        selected: [...new Set([...v2.selected, isDragging.id])],
        drag: {
          deltaInnerScroll: delta.scrollDelta[dimension],
          deltaMouse: delta.mouseDelta[dimension],
          // ancestor scroll
          deltaOuterScroll: 0,
          id: isDragging.id,
        },
        window: {
          ...v2.window,
          // ancestor scroll
          scroll: isDragging.scrollStart[dimension],
        },
      })
    : undefined;

  if (v2.items.length === 14) {
    // console.log("@moveResult", v2.items, moveResult);
  }

  return (
    <AnoDndContext.Provider
      value={{
        table,
        getPinned,
        setIsDragging,
        moveResult,
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
  const hidden = false;

  let transform: AnoTransform = { x: 0, y: 0 };
  // if (isDraggingThis) {
  //   // dragging from left pinned to center
  //   // if (
  //   //   ctx.getPinned(ctx.isDragging.id) === "left" &&
  //   //   ctx.getPinned(ctx.closestCol.id) === false
  //   // ) {
  //   //   pinned = false;
  //   //   console.log("YES");
  //   // }

  //   transform = {
  //     [dimension]: totalDelta(ctx.delta, dimension),
  //     [antiDimesion]: 0,
  //   };
  // }

  let transition = "transform 200ms ease";

  const prevIndexRef = React.useRef(thisIndex);
  const updatedIndex = prevIndexRef.current !== thisIndex;
  const overrideRet = React.useRef<{
    transform: AnoTransform;
    transition: string;
  } | null>(null);

  let pinned: undefined | PinPos = undefined;

  if (ctx.closestCol && ctx.isDragging && !isDraggingThis && ctx.moveResult) {
    const indexDiff = ctx.closestCol.index - ctx.isDragging.index;

    // console.log(
    //   "@indexDiff",
    //   ctx.closestCol.id,
    //   ctx.closestCol.index,
    //   ctx.isDragging.index,
    // );

    const displacement = ctx.moveResult.displacements[id];
    // hidden = !displacements.displacedDisplayedRange.has(id);

    pinned = ctx.moveResult.pinned[id];

    transform = {
      [dimension]: displacement,
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

  return { ...ret, hidden, pinned };
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

  const { transition, transform, hidden, pinned } = useGetStyle(
    ctx,
    id,
    thisIndex,
    false,
  );

  // const dragHandleStyle = useGetStyle(
  //   ctx,
  //   id,
  //   thisIndex,
  //   true,
  // );

  return {
    table: ctx.table,
    pinned,
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
        const tableRect = scrollEl.getBoundingClientRect();
        ctx.setIsDragging({
          id,
          mouseStart: { x: ev.clientX, y: ev.clientY },
          handleOffset: {
            x: ev.clientX - rect.left,
            y: ev.clientY - rect.top,
          },
          itemPos: {
            x: rect.left,
            y: rect.top,
          },
          scrollStart: {
            x: scrollEl.scrollLeft,
            y: scrollEl.scrollTop,
          },
          index: thisIndex,
          tablePos: {
            x: tableRect.left,
            y: tableRect.top,
          },
          ...ctx.getPinned(id),
        });
      },
    },
    setNodeRef: (el: HTMLElement | null) => {
      ctx.setNodeRef(id, el);
    },
    attributes: {},
  };
};

const useColAttrs = ({
  cell,
  start,
  offsetLeft,
}: {
  cell: Cell<User, unknown> | Header<User, unknown>;
  start: number;
  offsetLeft: number;
}) => {
  const {
    isDragging,
    setNodeRef,
    transform: _transform,
    transition,
    pinned,
    table,
    attributes,
    listeners,
  } = useAnoDrag(AnoDndColContext, cell.column.id, cell.column.getIndex());

  let isPinned = pinned ?? cell.column.getIsPinned();

  if (isPinned === "start") {
    isPinned = "left";
  } else if (isPinned === "end") {
    isPinned = "right";
  }

  // const transform: Transform | null = _transform
  //   ? { ..._transform, y: 0 }
  //   : null;

  const dragTransform = _transform ? ` + ${_transform.x}px` : "";

  const transform = isPinned
    ? "none"
    : // : `translate3d(calc(var(--virtual-padding-left, 0) * 1px${dragTransform}), 0, 0)`;
      `translate3d(calc(0px${dragTransform}), 0, 0)`;

  const pinnedRightLeftPos =
    table.getTotalSize() -
    (cell.column.getAfter("right") + cell.column.getSize());

  const transformedRightLeftPos = pinnedRightLeftPos + (_transform.x ?? 0);

  const transformedRightRightPos =
    table.getTotalSize() - (transformedRightLeftPos + cell.column.getSize());

  if (isPinned === "right") {
    // console.log(transformedRightRightPos);
  }
  return {
    isDragging,
    transform,
    transition,
    isPinned,
    attributes,
    listeners,
    setNodeRef,
    dragStyle: {
      position: isPinned ? "sticky" : "relative",
      ...(isPinned
        ? {
            left:
              isPinned === "left"
                ? `${cell.column.getStart("left") + (_transform.x ?? 0)}px`
                : undefined,
            right:
              isPinned === "right"
                ? `${transformedRightRightPos}px`
                : undefined,
          }
        : {
            // left: start,
          }),
    } as CSSProperties,
  };
};

const DragAlongCell = React.memo(function DragAlongCell({
  cell,
  start,
  offsetLeft,
}: {
  cell: Cell<User, unknown>;
  start: number;
  offsetLeft: number;
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

  const { isDragging, transform, transition, dragStyle, setNodeRef, isPinned } =
    useColAttrs({
      cell,
      start,
      offsetLeft,
    });

  // const {
  //   isDragging,
  //   setNodeRef,
  //   transform: _transform,
  //   transition,
  //   pinned,
  //   table,
  // } = useAnoDrag(AnoDndColContext, cell.column.id, cell.column.getIndex());

  // let isPinned = pinned ?? cell.column.getIsPinned();

  // if (isPinned === "start") {
  //   isPinned = "left";
  // } else if (isPinned === "end") {
  //   isPinned = "right";
  // }

  // const transform: Transform | null = _transform
  //   ? { ..._transform, y: 0 }
  //   : null;

  // const dragTransform = _transform ? ` + ${_transform.x}px` : "";

  // const transform = isPinned
  //   ? "none"
  //   : // : `translate3d(calc(var(--virtual-padding-left, 0) * 1px${dragTransform}), 0, 0)`;
  //     `translate3d(calc(0px${dragTransform}), 0, 0)`;

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

  // const pinnedRightLeftPos =
  //   table.getTotalSize() -
  //   (cell.column.getAfter("right") + cell.column.getSize());

  // const transformedRightLeftPos = pinnedRightLeftPos + (_transform.x ?? 0);

  // const transformedRightRightPos =
  //   table.getTotalSize() - (transformedRightLeftPos + cell.column.getSize());

  // if (isPinned === "right") {
  //   console.log(transformedRightRightPos);
  // }

  return (
    <div
      key={cell.id}
      ref={setNodeRef}
      className="drag-along-cell td"
      {...{
        style: {
          ...style,
          // ...getCommonPinningStyles(cell.column),
          // width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
          width: cell.column.getSize(),
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          zIndex: isDragging || isPinned ? 5 : 0,
          backgroundColor: isPinned ? "black" : "transparent",
          ...dragStyle,
        },
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </div>
  );
});

function App() {
  // function App2() {

  const { data, setData, columnOrder, setColumnOrder, table, getSubRows } =
    useBigTable();
  // const { data, setData, columnOrder, setColumnOrder, table, getSubRows } =
  //   useSmallTable();

  return (
    <div style={{ textAlign: "center" }}>
      <VirtualizedTable
        width={1920}
        height={1600}
        data={data}
        updateData={setData}
        columnOrder={columnOrder}
        updateColumnOrder={setColumnOrder}
        table={table}
        getSubRows={getSubRows}
        updateSubRows={(row, newSubRows) => {
          return { ...row, otherCountries: newSubRows };
        }}
        getId={(row) => String(row.id)}
        getGroup={(row) => "root"}
        rootGroup="root"
        rowHeight={tableRowHeight}
      />
    </div>
  );
}

// function App() {
function App1() {
  const columns: ColumnDef<User, any>[] = [];
  const [data, setData] = React.useState<User[]>(() =>
    generateTableData({ maxRows: 1e2 }),
  );
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
    getSubRows: (row) => {
      // console.log('??', row);
      return row.otherCountries;
    },
    enableRowSelection: true,
  });
  console.log(table.getSelectedRowModel().flatRows);
  const { rows } = table.getRowModel();
  const rowIds = React.useMemo(() => {
    return rows.map((row) => row.id);
  }, [rows]);

  // reorder columns after drag & drop
  function handleColDragEnd(event: AnoDndEvent) {
    setIsDragging(false);
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const overCol = table.getColumn(over.id);
      if (!overCol) {
        throw new Error("No column found");
      }
      const activeCol = table.getColumn(active.id);
      if (!activeCol) {
        throw new Error("No column found");
      }
      const pinned = overCol.getIsPinned();
      activeCol.pin(pinned);
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

      const oldIndex = getFlatIndex(oldRow);
      const newIndex = getFlatIndex(newRow);

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
        .rows.map((row) => getFlatIndex(row));

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

  const [isDragging, setIsDragging] = useState(false);

  // const headerGroups = table.getHeaderGroups();

  // const draggedRowRef = React.useRef<string | null>(null);
  const [draggedRowId, setDraggedRowId] = React.useState<string | null>(null);

  const _refs = { table, rowIds };
  const refs = React.useRef(_refs);
  refs.current = _refs;

  const defaultRowWindowRef = React.useRef<number[] | null>(null);

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

  const vhead = useHeaderGroupVirtualizers({
    headerGroups: table.getHeaderGroups(),
    tableContainerRef,
    table,
    type: "header",
  });
  const vfoot = useHeaderGroupVirtualizers({
    headerGroups: table.getFooterGroups(),
    tableContainerRef,
    table,
    type: "footer",
  });

  const tableVars: { [key: string]: number } = {
    "--virtual-offset-top":
      virtualRows.find((row) =>
        draggedRowId ? row.index !== rowIds.indexOf(draggedRowId) : true,
      )?.start ?? 0,
  };

  // for the last col and the rest of the table body
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
  // console.log("@table.getTotalSize()", table.getTotalSize());

  return (
    <AnoDndProvider
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
          size: 1920,
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
        vhead.updateAllDraggedIndexes(null);
      }}
      onDragCancel={() => {
        vhead.updateAllDraggedIndexes(null);
        setIsDragging(false);
      }}
      onDragStart={(ev) => {
        setIsDragging(true);
        const id = ev.active.id;
        if (id && typeof id === "string") {
          vhead.headerGroups.forEach((headerGroup, headerIndex) => {
            const col = headerGroup.headers.findIndex(
              (header) => header.id === id,
            );
            if (col !== -1) {
              vhead.updateDraggedIndex(headerIndex, col);
            }
          });
        }
      }}
      AnoDndContext={AnoDndColContext}
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
              (end?.start ?? r.length - 1) + (end?.size ?? tableRowHeight),
            ],
          };
        };
        let range = getRange([0, r.length - 1]);

        if (vhead.defaultColWindowRef.current) {
          const currentWindow = vhead.defaultColWindowRef.current;
          range = getRange([
            rows[currentWindow[0]].index,
            rows[currentWindow[currentWindow.length - 1]].index,
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
            dragged: AnoDndActive,
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
      <AnoDndProvider
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
            size: 1600,
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
              dragged: AnoDndActive,
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
              rowVirtualizer.measurementsCache[getFlatIndex(row)].start ??
              estimateStart(getFlatIndex(row))
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
            {vhead.headerGroups.map((headerGroup, headerIndex, arr) => {
              const { virtualColumns, virtualizer } =
                vhead.getVirtualHeaders(headerIndex);

              return renderHeaderGroup({
                headerGroup,
                virtualColumns,
                virtualizer,
                isClosestToTable: headerIndex === arr.length - 1,
                isDragging,
                table,
                defToRender: "header",
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
                isDragging,
                table,
                defToRender: "footer",
              });
            })}
          </div>
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
  totalWidth,
  totalHeight,
}: {
  virtualColumns: VirtualItem[];
  virtualRows: VirtualItem[];
  rows: Row<User>[];
  measureElement: (el?: HTMLElement | null) => void;
  width: number;
  totalWidth: number;
  totalHeight: number;
}) => {
  const { offsetLeft: offsetTop, offsetRight: offsetBottom } =
    getColVirtualizedOffsets({
      virtualColumns: virtualRows,
      getIsPinned(vcIndex) {
        const row = rows[vcIndex];
        return !!row.getIsPinned();
      },
      totalSize: totalHeight,
    });

  const loop = (predicate: (header: Row<User>) => boolean) => {
    return (
      <>
        {virtualRows
          .map((virtualRow) => ({
            row: rows[virtualRow.index],
            start: virtualRow.start,
          }))
          .filter(({ row }) => predicate(row))
          .map(({ row, start }) => {
            return (
              <TableRow
                key={row.id}
                row={row}
                virtualOffsetTop={start}
                virtualColumns={virtualColumns}
                measureElement={measureElement}
                width={width}
                totalSize={totalWidth}
              />
            );
          })}
      </>
    );
  };

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
      {loop((row) => row.getIsPinned() === "top")}
      <div style={{ height: offsetTop }}></div>
      {loop((row) => row.getIsPinned() === false)}
      <div style={{ height: offsetBottom }}></div>
      {loop((row) => row.getIsPinned() === "bottom")}

      {/* {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index];

        return (
          <TableRow
            key={row.id}
            row={row}
            virtualOffsetTop={virtualRow.start}
            virtualColumns={virtualColumns}
            measureElement={measureElement}
            width={width}
            totalSize={totalSize}
          />
        );
      })} */}
    </div>
  );
};

function DisplayHeader({
  header,
  defToRender,
}: {
  header: Header<User, unknown>;
  defToRender: "footer" | "header";
}) {
  const isPinned = header.column.getIsPinned();
  return (
    <div
      key={header.id}
      {...{
        className: "th",
        style: {
          // ...getCommonPinningStyles(header.column),
          // transform: isPinned ? "none" : `translate3d(${offsetLeft}px, 0, 0)`,
          transition: "width transform 0.2s ease-in-out",
          whiteSpace: "nowrap",
          display: "flex",
          paddingRight: "8px",
          paddingLeft: "8px",
          overflow: "hidden",
          height: "32px",
          // width: `calc(var(--header-${header?.id}-size) * 1px)`,
          width: header.getSize(),
          left:
            isPinned === "left" ? header.column.getStart("left") : undefined,
          right:
            isPinned === "right" ? header.column.getAfter("right") : undefined,
          position: isPinned ? "sticky" : "relative",
          backgroundColor: isPinned ? "black" : "transparent",
          zIndex: isPinned ? 2 : 1,
        },
      }}
    >
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        {header.isPlaceholder
          ? null
          : flexRender(
              header.column.columnDef[defToRender],
              header.getContext(),
            )}
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
  totalSize,
}: {
  row: Row<User>;
  virtualOffsetTop: number;
  virtualColumns: VirtualItem[];
  measureElement: (el?: HTMLElement | null) => void;
  width: number;
  totalSize: number;
}) {
  const visibileCells = row.getVisibleCells();

  const { transform, transition, setNodeRef, isDragging, hidden } = useAnoDrag(
    AnoDndRowContext,
    row.id,
    getFlatIndex(row),
  );

  // console.log("@transform?.y ?? 0", transform?.y ?? 0);

  const style: CSSProperties = {
    // position: "absolute",
    // transform: `translate3d(calc(var(--virtual-padding-left, 0) * 1px), ${virtualRow.start}px, 0)`,
    // transform: `translate3d(0, ${virtualOffsetTop}px, 0)`,
    // transform: transform
    //   ? CSS.Transform.toString(transform)
    //   : `translate3d(0, ${virtualOffsetTop}px, 0)`,
    transform: `translate3d(0, ${transform?.y ?? 0}px, 0)`,
    // top: virtualOffsetTop,
    position: "relative",
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

  // let lastPinned: undefined | number;
  // let firstNonPinned: undefined | number;
  // for (let i = 0; i < virtualColumns.length; i++) {
  //   const vc = virtualColumns[i];
  //   const header = visibileCells[vc.index];
  //   if (header.column.getIsPinned()) {
  //     lastPinned = i;
  //   } else {
  //     firstNonPinned = i;
  //     break;
  //   }
  // }

  // let offsetLeft = 0;

  // if (typeof firstNonPinned !== "undefined") {
  //   offsetLeft = virtualColumns[firstNonPinned].start;
  //   if (typeof lastPinned !== "undefined") {
  //     offsetLeft -= virtualColumns[lastPinned].end;
  //   }
  // }

  const { offsetLeft, offsetRight } = getColVirtualizedOffsets({
    virtualColumns,
    getIsPinned(vcIndex) {
      const header = visibileCells[vcIndex];
      return !!header.column.getIsPinned();
    },
    totalSize,
  });

  const loop = (predicate: (header: Cell<User, unknown>) => boolean) => {
    return (
      <>
        {virtualColumns
          .map((virtualColumn) => ({
            cell: visibileCells[virtualColumn.index],
            start: virtualColumn.start,
          }))
          .filter(({ cell }) => predicate(cell))
          .map(({ cell, start }) => {
            return (
              <DragAlongCell
                key={cell.id}
                cell={cell}
                start={start}
                offsetLeft={offsetLeft}
              />
            );
          })}
      </>
    );
  };

  const isExpanded = row.subRows.length === 0 && row.getIsExpanded();

  return (
    <>
      <div
        style={{
          ...style,
        }}
        data-index={getFlatIndex(row)}
        ref={(el) => {
          setNodeRef(el);
          if (isExpanded) {
            console.log("measureElement", row.id, getFlatIndex(row));
            measureElement(el);
          }
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
          {loop((cell) => cell.column.getIsPinned() === "left")}
          <div style={{ width: offsetLeft }}></div>
          {loop((cell) => cell.column.getIsPinned() === false)}
          <div style={{ width: offsetRight }}></div>
          {loop((cell) => cell.column.getIsPinned() === "right")}
        </div>
        {isExpanded && <div>{renderSubComponent({ row })}</div>}
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

/**
 * when we are only rendering a window of columns while maintaining a scrollbar we need to move the elements as we remove elements to the left
 * we are assuming that the columns are rendered in order, so pinned left, followed by non-pinned, followed by pinned right
 */
function getColVirtualizedOffsets({
  virtualColumns,
  getIsPinned,
  totalSize,
}: {
  virtualColumns: { index: number; start: number; end: number }[];
  getIsPinned: (vcIndex: number) => boolean;
  totalSize: number;
}) {
  let offsetLeft = 0;
  let offsetRight = 0;

  {
    let lastPinned: undefined | number;
    let firstNonPinned: undefined | number;
    for (let i = 0; i < virtualColumns.length; i++) {
      const vc = virtualColumns[i];
      if (getIsPinned(vc.index)) {
        lastPinned = i;
      } else {
        firstNonPinned = i;
        break;
      }
    }

    if (typeof firstNonPinned !== "undefined") {
      offsetLeft = virtualColumns[firstNonPinned].start;
      if (typeof lastPinned !== "undefined") {
        offsetLeft -= virtualColumns[lastPinned].end;
      }
    }
  }
  {
    // from right to left
    let lastPinned: undefined | number;
    let firstNonPinned: undefined | number;
    for (let i = virtualColumns.length - 1; i >= 0; i--) {
      const vc = virtualColumns[i];
      if (getIsPinned(vc.index)) {
        lastPinned = i;
      } else {
        firstNonPinned = i;
        break;
      }
    }

    // a,b, , , , , ,c,d // pinned
    // a,b,c,d,e,f,g,h,i // window
    // offsetRight should be 0 because c.start - g.start = 0
    // g = firstNonPinned
    // c = lastPinned
    // lastPinned.start - firstNonPinned.end

    // in this scenario we have no pinned, first nonPinned will be i, and size - firstNonPinned.end = 0
    // a,b,c,d,e,f,g,h,i

    // in this scneario we have scrolled a bit
    //      |               |
    // a,b,c,d,e,f,g,h,i,j,k,l,m
    // firstNonPinned = is k, we must have an offsetRight of size - k.end

    // in this scneario we have scrolled a bit, and we have pinned
    //      |            a,b|     // pinned
    // a,b,c,d,e,f,g,h,i,j,k,l,m  // non-pinned
    // firstNonPinned = i
    // lastPinned = a
    // a.start - i.end

    if (typeof firstNonPinned !== "undefined") {
      offsetRight = totalSize - virtualColumns[firstNonPinned].end;
      if (typeof lastPinned !== "undefined") {
        offsetRight =
          virtualColumns[lastPinned].start - virtualColumns[firstNonPinned].end;
      }
    }
  }
  return { offsetLeft, offsetRight };
}

function getFlatIndex(row: Row<User>) {
  let index = row.index;
  let parent = row.getParentRow();
  while (parent) {
    index += 1; // for the parent row
    index += parent.index;
    parent = parent.getParentRow();
  }
  return index;
}

function renderHeaderGroup({
  headerGroup,
  virtualColumns,
  virtualizer,
  isClosestToTable,
  isDragging,
  table,
  defToRender,
}: {
  headerGroup: HeaderGroup<User>;
  virtualColumns: VirtualItem[];
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  isClosestToTable: boolean;
  isDragging: boolean;
  table: Table<User>;
  defToRender: "footer" | "header";
}) {
  const { offsetLeft, offsetRight } = getColVirtualizedOffsets({
    virtualColumns,
    getIsPinned(vcIndex) {
      const header = headerGroup.headers[vcIndex];
      return !!header.column.getIsPinned();
    },
    totalSize: virtualizer.getTotalSize(),
  });

  const loop = (predicate: (header: Header<User, unknown>) => boolean) => {
    return (
      <>
        {!isClosestToTable ? (
          isDragging ? null : (
            <>
              {virtualColumns
                .map((vc) => ({
                  header: headerGroup.headers[vc.index],
                  start: vc.start,
                }))
                .filter(({ header }) => predicate(header))
                .map(({ header, start }) => {
                  return (
                    <DisplayHeader
                      key={header.id}
                      header={header}
                      defToRender={defToRender}
                    />
                  );
                })}
            </>
          )
        ) : (
          <>
            {virtualColumns
              .map((vc) => ({
                header: headerGroup.headers[vc.index],
                start: vc.start,
              }))
              .filter(({ header }) => predicate(header))
              .map(({ header, start }) => {
                return (
                  <DraggableTableHeader
                    key={header.id}
                    header={header}
                    table={table}
                    start={start}
                    offsetLeft={offsetLeft}
                    defToRender={defToRender}
                  />
                );
              })}
          </>
        )}
      </>
    );
  };

  return (
    <div
      key={headerGroup.id}
      style={{
        display: "flex",
        height: tableRowHeight,
      }}
    >
      {loop((header) => header.column.getIsPinned() === "left")}
      <div style={{ width: offsetLeft }}></div>
      {loop((header) => header.column.getIsPinned() === false)}
      <div style={{ width: offsetRight }}></div>
      {loop((header) => header.column.getIsPinned() === "right")}
    </div>
  );
}

function useHeaderGroupVirtualizers(props: {
  headerGroups: HeaderGroup<User>[];
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  table: Table<User>;
  type: "footer" | "header";
}) {
  const headerGroups = React.useMemo(
    () =>
      props.headerGroups.filter((group) => {
        return group.headers.some(
          (header) => header.column.columnDef[props.type],
        );
      }),
    [props.headerGroups, props.type],
  );

  const _draggedIndexRef = React.useRef<(number | null)[]>(
    headerGroups.map(() => null),
  );

  const updateDraggedIndex = (headerIndex: number, val: number | null) => {
    if (!val && _draggedIndexRef.current[headerIndex]) {
      visibleColsOutsideVirtualRange.current[headerIndex].delete(
        _draggedIndexRef.current[headerIndex],
      );
    }
    _draggedIndexRef.current[headerIndex] = val;
  };

  const updateAllDraggedIndexes = (val: number | null) => {
    headerGroups.forEach((_, headerIndex) => {
      updateDraggedIndex(headerIndex, val);
    });
  };

  const visibleColsOutsideVirtualRange = React.useRef(
    headerGroups.map(() => new Set<number>()),
  );

  const getDraggedIndex = (headerIndex: number) =>
    _draggedIndexRef.current[headerIndex];

  const defaultColWindowRef = React.useRef<number[] | null>(null);

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
      const headers = headerGroups[headerIndex].headers;
      return {
        getScrollElement: () => props.tableContainerRef.current,
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
          const sortedRange = [...next].sort((a, b) => {
            return a - b;
          });
          return sortedRange;
        },
      };
    },
    [headerGroups, props.tableContainerRef],
  );

  const rerender = React.useReducer(() => ({}), {})[1];

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
    props.table.getState().columnSizingInfo.isResizingColumn === false
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

  headerColVirtualizers.forEach((cv, i) => {
    cv.setOptions(headerColVirtualizerOptions[i]);
    headerGroups[i].headers.forEach((header, j) => {
      cv.resizeItem(j, header.getSize());
    });
  });

  //different virtualization strategy for columns - instead of absolute and translateY, we add empty columns to the left and right
  const getVirtualHeaders = (headerIndex: number) => {
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
    return {
      virtualPaddingLeft,
      virtualPaddingRight,
      virtualColumns,
      virtualizer,
    };
  };

  return {
    headerGroups,
    getVirtualHeaders,
    headerColVirtualizers,
    updateAllDraggedIndexes,
    updateDraggedIndex,
    defaultColWindowRef,
    body: {
      headerGroup:
        props.type === "header"
          ? headerGroups[headerGroups.length - 1]
          : headerGroups[0],
      virtualizer:
        props.type === "header"
          ? headerColVirtualizers[headerColVirtualizers.length - 1]
          : headerColVirtualizers[0],
    },
  };
}
