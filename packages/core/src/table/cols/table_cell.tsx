import { flexRender } from "@tanstack/react-table";
import React from "react";
import { useMeasureCellContext } from "../../measure_cell_context";
import { VirtualCellContext } from "../contexts/virtual_cell_context";
import { useTableContext } from "../table_context";
import { VirtualCell } from "../types";
import { useTableProps } from "../hooks/use_table_props";

export const TableCell = React.memo(
  function TableCell({ cell }: { cell: VirtualCell }) {
    const ctx = useTableContext();
    const { skin } = ctx;

    const measuring = useMeasureCellContext();
    if (measuring) {
      measuring.registerCell(cell.id);
    }
    const { refs } = useTableContext();
    const { cellDef, cellContext } = useTableProps(
      () => {
        return {
          cellDef: cell.cell().column.columnDef.cell,
          cellContext: cell.cell().getContext(),
        };
      },
      {
        arePropsEqual: (prev, next) => {
          const shouldUpdateFn = refs.current.shouldUpdate?.cell;
          if (shouldUpdateFn) {
            const arePropsEqual = shouldUpdateFn(
              prev.cellContext,
              next.cellContext,
            )
              ? false
              : true;
            return arePropsEqual;
          }

          // shallow equal will not work because the objects will always be different
          // so we always return false to always re-render and if the user wants
          // better performance they can return true in the shouldUpdate function
          return false;
        },
      },
    );
    const content = React.useMemo(
      () => flexRender(cellDef, cellContext),
      [cellDef, cellContext],
    );
    return (
      <VirtualCellContext.Provider value={cell}>
        <skin.Cell
          isMeasuring={Boolean(measuring)}
          ref={
            measuring
              ? (ref) => {
                  measuring.storeRef(ref, {
                    type: "cell",
                    id: cell.id,
                    columnId: cell.vheader.columnId,
                  });
                }
              : undefined
          }
        >
          {content}
        </skin.Cell>
      </VirtualCellContext.Provider>
    );
  },
  (prev, next) => {
    return prev.cell.id === next.cell.id;
  },
);
