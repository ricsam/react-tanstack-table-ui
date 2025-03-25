import { Cell, flexRender } from "@tanstack/react-table";
import React from "react";
import { VirtualHeader } from "./draggable_table_header";
import { useTableContext } from "../table_context";

export const DragAlongCell = React.memo(function DragAlongCell({
  cell,
  header,
}: {
  cell: Cell<any, unknown>;
  header: VirtualHeader;
}) {
  const { skin } = useTableContext();
  return (
    <skin.Cell header={header}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </skin.Cell>
  );
});
