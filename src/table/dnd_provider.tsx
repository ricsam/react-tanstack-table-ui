import {
  ColumnPinningPosition,
  RowSelectionState,
  Table,
} from "@tanstack/react-table";
import React, { useState } from "react";
import { findDeltaAtPosition, Item } from "../Item";
import { move, Item as MoveItem, VirtualizedWindow } from "../move";
import { VirtualItem } from "../react-virtual";

const totalDelta = (delta: Delta, dimension: "x" | "y") =>
  delta.mouseDelta[dimension] + delta.scrollDelta[dimension];

export type DndActive = {
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

type DndSelected = {
  state: RowSelectionState;
};

type Delta = {
  mouseDelta: { x: number; y: number };
  scrollDelta: { x: number; y: number };
};
const initialDelta: Delta = {
  mouseDelta: { x: 0, y: 0 },
  scrollDelta: { x: 0, y: 0 },
};

export type DndContextType = {
  setIsDragging: React.Dispatch<React.SetStateAction<DndActive | null>>;
  isDragging: DndActive | null;
  delta: Delta;
  // cols: { size: number; id: string }[];
  closestCol: {
    id: string;
    index: number; // non-pinned index
    pinned: ColumnPinningPosition;
  } | null;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onDragStart: (id: string) => void;
  getNodeRef: (id: string) => HTMLElement | null;
  setNodeRef: (id: string, el: HTMLElement | null) => void;
  dimension: "x" | "y";
  selected?: DndSelected;
  getRenderedRange: () => string[];
  getSize: (id: string) => number;
  getStart: (id: string) => number;
  table: Table<any>;
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

export const DndProvider = ({
  children,
  cols,
  scrollRef,
  onDragEnd,
  onDragStart,
  onDragCancel,
  DndContext,
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
  onDragEnd: (result?: { delta: number; pin: false | "start" | "end" }) => void;
  onDragStart: (id: string) => void;
  onDragCancel: () => void;
  DndContext: React.Context<DndContextType | undefined>;
  dimension: "x" | "y";
  getAverageSize: () => number;
  selected?: DndSelected;
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
  table: Table<any>;
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
      dragged: DndActive,
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
  const [isDragging, setIsDragging] = useState<DndActive | null>(null);
  const [delta, setDelta] = useState<Delta>(initialDelta);
  const [closestCol, setClosestCol] = useState<{
    id: string;
    /**
     * non pinned index
     */
    index: number;
    pinned: false | "left" | "right";
  } | null>(null);

  const moveResult = React.useMemo(
    () =>
      isDragging
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
        : undefined,
    [
      delta.mouseDelta,
      delta.scrollDelta,
      dimension,
      isDragging,
      v2.items,
      v2.selected,
      v2.window,
    ],
  );

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
    dragged: DndActive,
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
      refs.current.onDragEnd(
        moveResult
          ? {
              delta: moveResult.dragged.indexDelta,
              pin: moveResult.dragged.pinned,
            }
          : undefined,
      );
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
  }, [isDragging, moveResult, scrollRef]);

  const nodeRef = React.useRef<Record<string, HTMLElement | null>>({});

  if (v2.items.length === 14) {
    // console.log("@moveResult", v2.items, moveResult);
  }

  return (
    <DndContext.Provider
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
    </DndContext.Provider>
  );
};

const createDndContext = () =>
  React.createContext<DndContextType | undefined>(undefined);

export const DndColContext = createDndContext();
export const DndRowContext = createDndContext();
