import { Cell, flexRender } from "@tanstack/react-table";
import React from "react";
import { VirtualHeaderContext } from "./virtual_header/context";
import { VirtualHeader } from "./virtual_header/types";
import { useTableContext } from "../table_context";
import { useDebugDeps } from "../../utils";

export const VirtualCell = React.memo(function VirtualizedCell({
  cell,
  header,
}: {
  cell: Cell<any, unknown>;
  header: VirtualHeader;
}) {
  const ctx = useTableContext();
  const { skin } = ctx;
  // console.log(useDebugDeps(ctx, cell, header));
  return (
    <VirtualHeaderContext.Provider value={header}>
      <skin.Cell header={header}>
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </skin.Cell>
    </VirtualHeaderContext.Provider>
  );
});
