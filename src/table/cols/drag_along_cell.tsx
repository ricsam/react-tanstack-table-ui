import { Cell, flexRender } from "@tanstack/react-table";
import React, { CSSProperties } from "react";
import { useColAttrs } from "../use_col_attrs";

export const DragAlongCell = React.memo(function DragAlongCell({
  cell,
  start,
  offsetLeft,
  rowHeight,
  colIndex,
}: {
  cell: Cell<any, unknown>;
  start: number;
  offsetLeft: number;
  rowHeight: number;
  colIndex: number;
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
      colIndex,
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
    height: rowHeight,
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
