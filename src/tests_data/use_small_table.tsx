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
        cell: ({ row, table }) => {
          const { rows } = table.getRowModel();
          const flatIndex = rows.indexOf(row);
          return (
            <RowDragHandleCell
              rowId={row.id}
              rowIndex={flatIndex}
              table={table}
            />
          );
        },
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

export const useSmallTableExpandable = () => {
  const [data, setData] = React.useState<SmallData[]>([
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      children: [
        {
          id: "1.1",
          firstName: "Jane",
          lastName: "Doe",
          children: [],
        },
        {
          id: "1.2",
          firstName: "Jim",
          lastName: "Smith",
          children: [],
        },
      ],
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
        cell: ({ row, table }) => {
          const { rows } = table.getRowModel();
          const flatIndex = rows.indexOf(row);
          return (
            <RowDragHandleCell
              rowId={row.id}
              rowIndex={flatIndex}
              table={table}
            />
          );
        },
        size: 60,
      },
      {
        id: "expand",
        size: 150,
        cell: ({ row }) => (
          <div
            style={{
              // Since rows are flattened by default,
              // we can use the row.depth property
              // and paddingLeft to visually indicate the depth
              // of the row
              paddingLeft: `${row.depth * 2}rem`,
            }}
          >
            <div>
              {row.getCanExpand() ? (
                <button
                  {...{
                    onClick: row.getToggleExpandedHandler(),
                    style: { cursor: "pointer" },
                  }}
                >
                  {row.getIsExpanded() ? "👇" : "👉"}
                </button>
              ) : (
                "🔵"
              )}{" "}
            </div>
          </div>
        ),
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
