import { flexRender } from "@tanstack/react-table";
import React from "react";
import { useMeasureCellContext } from "../../measure_cell_context";
import { createTablePropsSelector, shallowEqual } from "../../utils";
import { VirtualCellProvider } from "../providers/virtual_cell_provider";
import { useTableContext } from "../table_context";
import { ShouldUpdate } from "../types";

type TableCellProps = {
  columnIndex: number;
  rowIndex: number;
};

const cell = createTablePropsSelector(
  ({ rowIndex, columnIndex }: TableCellProps) => ({
    selector(props) {
      const cell =
        props.virtualData.body.cellLookup[rowIndex][columnIndex].cell;
      return cell;
    },
    callback: (cell) => {
      return {
        cellId: cell.id,
        columnId: cell.column.id,
      };
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [{ type: "tanstack_table" }],
    shouldUnmount: (table) => {
      return (
        table.virtualData.body.cellLookup[rowIndex]?.[columnIndex] === undefined
      );
    },
  }),
);

const cellDefSelector = createTablePropsSelector(
  ({
    rowIndex,
    columnIndex,
    getShouldUpdateFn,
  }: TableCellProps & {
    getShouldUpdateFn?: () => ShouldUpdate["cell"] | undefined;
  }) => ({
    selector(props) {
      const cell =
        props.virtualData.body.cellLookup[rowIndex][columnIndex].cell;
      return cell;
    },
    shouldUnmount: (table) => {
      return (
        table.virtualData.body.cellLookup[rowIndex]?.[columnIndex] === undefined
      );
    },
    callback: (cell) => {
      return {
        cellDef: cell.column.columnDef.cell,
        cellContext: cell.getContext(),
      };
    },
    dependencies: [{ type: "tanstack_table" }],
    areCallbackOutputEqual: (prev, next) => {
      const shouldUpdateFn = getShouldUpdateFn?.();
      if (shouldUpdateFn) {
        const arePropsEqual = shouldUpdateFn(prev.cellContext, next.cellContext)
          ? false
          : true;
        return arePropsEqual;
      }

      // shallow equal will not work because the objects will always be different
      // so we always return false to always re-render and if the user wants
      // better performance they can return true in the shouldUpdate function
      return false;
    },
  }),
);

export const TableCell = React.memo(function TableCell({
  columnIndex,
  rowIndex,
}: TableCellProps) {
  const ctx = useTableContext();
  const { skin } = ctx;

  const { cellId, columnId } = cell.useTableProps({ columnIndex, rowIndex });
  const { tableRef } = useTableContext();

  const measuring = useMeasureCellContext();
  if (measuring) {
    measuring.registerCell(cellId);
  }

  const { cellDef, cellContext } = cellDefSelector.useTableProps({
    columnIndex,
    rowIndex,
    getShouldUpdateFn: () => tableRef.current.uiProps.shouldUpdate?.cell,
  });

  const content = React.useMemo(
    () => flexRender(cellDef, cellContext),
    [cellDef, cellContext],
  );
  return (
    <VirtualCellProvider columnIndex={columnIndex} rowIndex={rowIndex}>
      <skin.Cell
        isMeasureInstance={Boolean(measuring)}
        ref={
          measuring
            ? (ref) => {
                measuring.storeRef(ref, {
                  type: "cell",
                  id: cellId,
                  columnId,
                });
              }
            : undefined
        }
      >
        {content}
      </skin.Cell>
    </VirtualCellProvider>
  );
});
