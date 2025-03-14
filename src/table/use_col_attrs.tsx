import { Cell, Header } from "@tanstack/react-table";
import { DndColContext } from "./dnd_provider";
import { useDrag } from "./use_drag";
import { CSSProperties } from "react";

export const useColAttrs = <T,>({
  cell,
  start,
  offsetLeft,
  colIndex,
  meta,
}: {
  cell: Cell<T, unknown> | Header<T, unknown>;
  start: number;
  offsetLeft: number;
  colIndex: number;
  meta?: any;
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
  } = useDrag({
    AnoDndContext: DndColContext,
    id: cell.column.id,
    thisIndex: colIndex,
    start,
    meta,
  });

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
  const leafs = cell.column.getLeafColumns();
  const firstLeaf = leafs[0];
  const lastLeaf = leafs[leafs.length - 1];

  const pinnedRightLeftPos =
    table.getTotalSize() - (lastLeaf.getAfter("right") + cell.column.getSize());

  const transformedRightLeftPos = pinnedRightLeftPos + (_transform.x ?? 0);

  const transformedRightRightPos =
    table.getTotalSize() - (transformedRightLeftPos + cell.column.getSize());

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
                ? `${firstLeaf.getStart("left") + (_transform.x ?? 0)}px`
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
