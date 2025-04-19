import { flexRender } from "@tanstack/react-table";
import React from "react";
import { useMeasureCellContext } from "../../measure_cell_context";
import { shallowEqual } from "../../utils";
import { useTableProps, UseTablePropsOptions } from "../hooks/use_table_props";
import { useTableRef } from "../hooks/use_table_ref";
import { VirtualCellProvider } from "../providers/virtual_cell_provider";
import { useTableContext } from "../table_context";
import { RttuiTable } from "../types";

type TableCellProps = {
  columnIndex: number;
  rowIndex: number;
};

const createTablePropsSelector = <D, T, U = RttuiTable>(
  callback: (props: D) => UseTablePropsOptions<T, U>,
) => {
  return {
    useTableProps: (props: D) => {
      return useTableProps(callback(props));
    },
  };
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
  }),
);

export const TableCell = React.memo(function TableCell({
  columnIndex,
  rowIndex,
}: TableCellProps) {
  const ctx = useTableContext();
  const { skin } = ctx;
  const tableRef = useTableRef();

  const { cellId, columnId } = cell.useTableProps({ columnIndex, rowIndex });

  const measuring = useMeasureCellContext();
  if (measuring) {
    measuring.registerCell(cellId);
  }

  const { cellDef, cellContext } = useTableProps({
    selector(props) {
      const cell =
        props.virtualData.body.cellLookup[rowIndex][columnIndex].cell;
      return cell;
    },
    callback: (cell) => {
      return {
        cellDef: cell.column.columnDef.cell,
        cellContext: cell.getContext(),
      };
    },
    dependencies: [{ type: "tanstack_table" }],
    areCallbackOutputEqual: (prev, next) => {
      const shouldUpdateFn = tableRef.current.uiProps.shouldUpdate?.cell;
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
