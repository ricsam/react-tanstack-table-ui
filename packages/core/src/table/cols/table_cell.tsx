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
    shouldUnmount: (table) => {
      return (
        table.virtualData.body.cellLookup[rowIndex]?.[columnIndex] === undefined
      );
    },
    callback: (props) => {
      const cell =
        props.virtualData.body.cellLookup[rowIndex][columnIndex].cell;
      return {
        cellDef: cell.column.columnDef.cell,
        cellContext: cell.getContext(),
        isScrolling: props.virtualData.isScrolling,
        isResizingColumn: props.virtualData.isResizingColumn,
      };
    },
    dependencies: [
      { type: "tanstack_table" },
      { type: "is_scrolling" },
      { type: "is_resizing_column" },
    ],
    areCallbackOutputEqual: (prev, next) => {
      const shouldUpdateFn = getShouldUpdateFn?.();
      if (shouldUpdateFn) {
        const arePropsEqual = shouldUpdateFn({
          context: {
            prev: prev.cellContext,
            next: next.cellContext,
          },
          isScrolling: next.isScrolling,
          isResizingColumn: next.isResizingColumn,
        })
          ? false
          : true;
        return arePropsEqual;
      } else {
        // for performance, by default, we don't allow the cells to re-render if the table is scrolling or resizing a column
        if (
          next.isScrolling.horizontal ||
          next.isScrolling.vertical ||
          next.isResizingColumn
        ) {
          return true;
        }
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

  const storeMeasuringRef = React.useCallback(
    (ref: HTMLDivElement) => {
      if (measuring) {
        measuring.storeRef(ref, {
          type: "cell",
          id: cellId,
          columnId,
        });
      }
    },
    [cellId, columnId, measuring],
  );

  return (
    <VirtualCellProvider columnIndex={columnIndex} rowIndex={rowIndex}>
      <skin.Cell
        isMeasureInstance={Boolean(measuring)}
        ref={React.useCallback(
          (ref: HTMLDivElement) => {
            storeMeasuringRef(ref);
            if (tableRef.current.uiProps.spreadsheetManager?.canSelect) {
              const selectionManager = tableRef.current.selectionManager;
              return selectionManager.setupCellElement(ref, {
                row: rowIndex,
                col: columnIndex,
              });
            }
          },
          [columnIndex, rowIndex, storeMeasuringRef, tableRef],
        )}
      >
        {content}
      </skin.Cell>
    </VirtualCellProvider>
  );
});
