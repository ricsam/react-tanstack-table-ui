import { RowSelectionState, Table } from "@tanstack/react-table";
import React, { useState } from "react";
import { DragInfo, moveInWindow, Item as MoveItem, VirtualizedWindow } from "./rows/dnd/move_in_window";

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
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onDragStart: (id: string, meta?: any) => void;
  getNodeRef: (id: string) => HTMLElement | null;
  setNodeRef: (id: string, el: HTMLElement | null) => void;
  dimension: "x" | "y";
  selected?: DndSelected;
  getSize: (id: string) => number;
  table: Table<any>;
  v2: V2;
  getPinned: (id: string) =>
    | {
        pinned: false;
      }
    | {
        pinned: "left" | "right";
        pinnedIndex: number;
      };
  moveResult?: ReturnType<typeof moveInWindow>;
};
export type V2 = {
  window: VirtualizedWindow;
  selected: string[];
  items: MoveItem[];
  /**
   * gets the leaf headers of a header group. If id isn't a header group it will just return an array of length 1 with the id
   */
  getGroup: (id: string) => string[];
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
  getSize,
  getPinned,
  table,
  v2,
}: {
  children: React.ReactNode;
  cols: { size: number; id: string }[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onDragEnd: (result?: { delta: number; pin: false | "start" | "end" }) => void;
  onDragStart: (id: string, meta?: any) => void;
  onDragCancel: () => void;
  DndContext: React.Context<DndContextType | undefined>;
  dimension: "x" | "y";
  getAverageSize: () => number;
  selected?: DndSelected;
  getSize: (id: string) => number;
  getPinned: (id: string) =>
    | {
        pinned: false;
      }
    | {
        pinned: "left" | "right";
        pinnedIndex: number;
      };
  table: Table<any>;
  v2: V2;
}) => {
  const [isDragging, setIsDragging] = useState<DndActive | null>(null);
  const [delta, setDelta] = useState<Delta>(initialDelta);

  const moveResult = React.useMemo(() => {
    if (isDragging) {
      const moveInput: {
        items: MoveItem[];
        selected: string[];
        window: VirtualizedWindow;
        drag: DragInfo;
      } = {
        items: v2.items,
        selected: v2.selected,
        drag: {
          deltaInnerScroll: delta.scrollDelta[dimension],
          deltaMouse: delta.mouseDelta[dimension],
          // ancestor scroll
          deltaOuterScroll: 0,
          // if we are moving a column group (so this is only applicable for the x-axis)
          id: v2.getGroup(isDragging.id).length > 1 ? undefined : isDragging.id,
        },
        window: {
          ...v2.window,
          // ancestor scroll
          scroll: isDragging.scrollStart[dimension],
        },
      };
      const moveResult = moveInWindow(moveInput);
      // console.log("@move", {
      //   moveResult,
      //   moveInput,
      // });
      return moveResult;
    }
    return undefined;
  }, [delta.mouseDelta, delta.scrollDelta, dimension, isDragging, v2]);

  const _refs = {
    isDragging,
    delta,
    onDragEnd,
    cols,
    onDragCancel,
    getAverageSize,
  };
  const refs = React.useRef(_refs);
  refs.current = _refs;

  React.useEffect(() => {
    if (!isDragging) {
      return;
    }

    const reset = () => {
      setIsDragging(null);
      setDelta(initialDelta);
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

      setDelta(newDelta);
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
      setDelta(newDelta);
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
        v2,
        table,
        getPinned,
        setIsDragging,
        moveResult,
        isDragging,
        delta,
        // cols,
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
        selected,
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
