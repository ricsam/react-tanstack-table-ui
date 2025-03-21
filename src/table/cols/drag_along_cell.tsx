import { Cell, flexRender } from "@tanstack/react-table";
import React from "react";
import { VirtualHeader } from "./draggable_table_header";

export const DragAlongCell = React.memo(function DragAlongCell({
  cell,
  header,
  rowHeight,
}: {
  cell: Cell<any, unknown>;
  header: VirtualHeader;
  rowHeight: number;
}) {
  const { isDragging, isPinned } = header;
  return (
    <div
      key={cell.id}
      className="drag-along-cell td"
      {...{
        style: {
          opacity: isDragging ? 0.8 : 1,
          height: rowHeight,
          width: header.width,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          zIndex: isDragging || isPinned ? 5 : 0,
          backgroundColor: isPinned ? "black" : "transparent",
          flexShrink: 0,
          ...header.style,
        },
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </div>
  );
});
