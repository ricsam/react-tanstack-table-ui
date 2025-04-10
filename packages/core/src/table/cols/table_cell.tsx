import { flexRender } from "@tanstack/react-table";
import { useMeasureCellContext } from "../../measure_cell_context";
import { VirtualCell } from "../rows/table_row";
import { useTableContext } from "../table_context";
import { VirtualCellContext } from "./virtual_cell/context";
import React from "react";

export const TableCell = React.memo(function TableCell({
  cell,
}: {
  cell: VirtualCell;
}) {
  const ctx = useTableContext();
  const { skin } = ctx;

  const measuring = useMeasureCellContext();
  if (measuring) {
    measuring.registerCell(cell.id);
  }
  return (
    <VirtualCellContext.Provider value={cell}>
      <skin.Cell
        cell={cell}
        isMeasuring={Boolean(measuring)}
        ref={
          measuring
            ? (ref) => {
                measuring.storeRef(ref, {
                  type: "cell",
                  id: cell.id,
                  columnId: cell.columnId,
                });
              }
            : undefined
        }
      >
        {flexRender(cell.cell.column.columnDef.cell, cell.cell.getContext())}
      </skin.Cell>
    </VirtualCellContext.Provider>
  );
});
