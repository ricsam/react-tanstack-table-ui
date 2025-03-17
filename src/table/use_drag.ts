import React from "react";
import { DndContextType } from "./dnd_provider";
import { PinPos } from "./rows/dnd/move_in_window";
import { flushSync } from "react-dom";

type Transform = {
  x?: number;
  y?: number;
};

function useGetStyle({
  ctx,
  id,
  thisIndex,
  isDraggingThis,
  start,
}: {
  ctx: DndContextType;
  id: string;
  thisIndex: number;
  isDraggingThis: boolean;
  start: number;
}) {
  const dimension = ctx.dimension;
  const antiDimesion = dimension === "x" ? "y" : "x";
  const hidden = false;

  let transform: Transform = { x: 0, y: 0 };
  let transition = "transform 200ms ease";

  const prevIndexRef = React.useRef(thisIndex);
  const updatedIndex = prevIndexRef.current !== thisIndex;
  const overrideRet = React.useRef<{
    transform: Transform;
    transition: string;
  } | null>(null);

  let pinned: undefined | PinPos = undefined;
  const group = ctx.v2.getGroup(id);

  if (
    ctx.moveResult?.dragged &&
    ctx.isDragging &&
    !isDraggingThis &&
    ctx.moveResult
  ) {
    // console.log(
    //   "@indexDiff",
    //   ctx.closestCol.id,
    //   ctx.closestCol.index,
    //   ctx.isDragging.index,
    // );

    let displacement = ctx.moveResult.displacements[id];
    pinned = ctx.moveResult.pinned[id];
    // we are moving a header group
    if (group.length > 1) {
      // then the first item in the group can represent how the header should be displaced
      displacement = ctx.moveResult.displacements[group[0]];
      pinned = ctx.moveResult.pinned[group[0]];
    }
    // hidden = !displacements.displacedDisplayedRange.has(id);

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

  const prevStartRef = React.useRef(start);
  const prevStart = prevStartRef.current;

  // const prevId = React.useRef(id);

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

export const useDrag = ({
  AnoDndContext,
  id,
  thisIndex,
  start,
  meta,
}: {
  AnoDndContext: React.Context<DndContextType | undefined>;
  id: string;
  thisIndex: number;
  start: number;
  meta?: any;
}) => {
  if (!AnoDndContext) {
    console.trace("wefoijwef");
  }
  const ctx = React.useContext(AnoDndContext);
  if (!ctx) {
    throw new Error("useAnoDrag must be used within AnoDndProvider");
  }

  const isDragHandle = Boolean(ctx.isDragging && ctx.isDragging.id === id);

  let isDraggingThis = isDragHandle;

  if (!isDraggingThis && ctx.selected && ctx.isDragging) {
    const selected = ctx.selected;
    if (ctx.moveResult) {
      isDraggingThis = Boolean(selected.state[id]);
    }
  }

  const { transition, transform, hidden, pinned } = useGetStyle({
    ctx,
    id,
    thisIndex,
    isDraggingThis: false,
    start,
  });

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
        ctx.onDragStart(id, meta);
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
