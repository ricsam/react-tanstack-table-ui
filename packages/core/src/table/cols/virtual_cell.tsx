import { Cell, flexRender } from "@tanstack/react-table";
import { useTableContext } from "../table_context";
import { VirtualHeaderContext } from "./virtual_header/context";
import { VirtualHeader } from "./virtual_header/types";

export const VirtualCell = function VirtualizedCell({
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
};
