import {
  ColumnDef,
  ColumnOrderState,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { iterateOverColumns } from "../table/iterate_over_columns";
import { RowDragHandleCell } from "../table/row_drag_handle_cell";
import { getFlatIndex } from "../table/utils";

type SmallData = {
  id: string;
  firstName: string;
  lastName: string;
  children: SmallData[];
};

export const useSmallTable = () => {
  const [data, setData] = React.useState<SmallData[]>([
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      children: [],
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Doe",
      children: [],
    },
    {
      id: "3",
      firstName: "Jim",
      lastName: "Smith",
      children: [],
    },
    {
      id: "4",
      firstName: "Jill",
      lastName: "Smith",
      children: [],
    },
    {
      id: "5",
      firstName: "Jack",
      lastName: "Brown",
      children: [],
    },
  ]);
  const columns = React.useMemo((): ColumnDef<SmallData, any>[] => {
    const columnHelper = createColumnHelper<SmallData>();

    return [
      {
        id: "drag-handle",
        header: "Move",
        cell: ({ row, table }) => (
          <RowDragHandleCell
            rowId={row.id}
            rowIndex={getFlatIndex(row)}
            table={table}
          />
        ),
        size: 60,
      },
      columnHelper.accessor("id", {
        id: "id",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("firstName", {
        id: "first-name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("lastName", {
        id: "last-name",
        cell: (info) => info.getValue(),
      }),
    ];
  }, []);

  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(() =>
    iterateOverColumns(columns),
  );

  const getSubRows = (row: SmallData) => {
    return row.children;
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder,
    },
    getRowId(originalRow, index, parent) {
      return originalRow.id;
    },
    onColumnOrderChange: setColumnOrder,
    defaultColumn: {
      minSize: 60,
      maxSize: 800,
    },
    columnResizeMode: "onChange",
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSubRows,
    enableRowSelection: true,
  });
  return { data, setData, columnOrder, setColumnOrder, table, getSubRows };
};
