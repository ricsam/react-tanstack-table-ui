import { Cell, flexRender } from "@tanstack/react-table";
import { useTableContext } from "../table_context";
import { VirtualHeaderContext } from "./virtual_header/context";
import { VirtualHeader } from "./virtual_header/types";
import { useMeasureCellContext } from "../../measure_cell_context";

export const VirtualCell = function VirtualizedCell({
  cell,
  header,
  isLastPinned,
  isFirstPinned,
  isLast,
  isFirst,
  isFirstCenter,
  isLastCenter,
}: {
  cell: Cell<any, unknown>;
  header: VirtualHeader;
  isLastPinned: boolean;
  isFirstPinned: boolean;
  isLast: boolean;
  isFirst: boolean;
  isFirstCenter: boolean;
  isLastCenter: boolean;
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
        isLastPinned={isLastPinned}
        isFirstPinned={isFirstPinned}
        isLast={isLast}
        isFirst={isFirst}
        isFirstCenter={isFirstCenter}
        isLastCenter={isLastCenter}
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
