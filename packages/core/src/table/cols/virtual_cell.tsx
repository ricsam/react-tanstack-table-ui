import { Cell, flexRender } from "@tanstack/react-table";
import { useTableContext } from "../table_context";
import { VirtualHeaderContext } from "./virtual_header/context";
import { VirtualHeader } from "./virtual_header/types";
import { useMeasureCellContext } from "../../measure_cell_context";

export const VirtualCell = function VirtualizedCell({
  cell,
  header,
}: {
  cell: Cell<any, unknown>;
  header: VirtualHeader;
}) {
  const ctx = useTableContext();
  const { skin } = ctx;

  const measuring = useMeasureCellContext();
  if (measuring) {
    measuring.registerCell(cell.id);
  }
  return (
    <VirtualHeaderContext.Provider value={header}>
      <skin.Cell
        header={header}
        isMeasuring={Boolean(measuring)}
        ref={
          measuring
            ? (ref) => {
                measuring.storeRef(ref, cell);
              }
            : undefined
        }
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </skin.Cell>
    </VirtualHeaderContext.Provider>
  );
};
