import {
  ColumnDef,
  ColumnOrderState,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { IndeterminateCheckbox } from "./indeterminate_checkbox";
import { RowDragHandleCell } from "./row_drag_handle_cell";
import { TableConfig } from "./table_config";
import { useBigTable } from "./use_big_table";

// Import types from SmallData from use_small_table
type SmallData = {
  id: string;
  firstName: string;
  lastName: string;
  children: SmallData[];
};

// Helper function to generate the column IDs
const iterateOverColumns = (columns: ColumnDef<any, any>[]) => {
  return columns.reduce<string[]>((acc, column) => {
    if (column.id) {
      acc.push(column.id);
    }

    if ("columns" in column && column.columns) {
      acc.push(...iterateOverColumns(column.columns));
    }

    return acc;
  }, []);
};

export const useConfigurableTable = (config: TableConfig) => {
  const bigTableResult = useBigTable();

  // Generate small data based on config
  const generateSmallData = (
    count: number,
    withChildren: boolean,
  ): SmallData[] => {
    const firstNames = [
      "John",
      "Jane",
      "Jim",
      "Jill",
      "Jack",
      "Jessica",
      "James",
      "Jennifer",
    ];
    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Jones",
      "Brown",
      "Davis",
      "Miller",
      "Wilson",
    ];

    return Array.from({ length: count }).map((_, i) => ({
      id: (i + 1).toString(),
      firstName: firstNames[i % firstNames.length],
      lastName: lastNames[i % lastNames.length],
      children:
        withChildren && i < 2
          ? [
              {
                id: `${i + 1}.1`,
                firstName: firstNames[(i + 3) % firstNames.length],
                lastName: lastNames[(i + 3) % lastNames.length],
                children: [],
              },
              {
                id: `${i + 1}.2`,
                firstName: firstNames[(i + 4) % firstNames.length],
                lastName: lastNames[(i + 4) % lastNames.length],
                children: [],
              },
            ]
          : [],
    }));
  };

  // Create state for the table data
  const [smallData, setSmallData] = React.useState<SmallData[]>(() =>
    generateSmallData(config.rowCount, config.features.expandable),
  );

  // Update data when config changes
  React.useEffect(() => {
    if (config.dataSize === "small") {
      setSmallData(
        generateSmallData(config.rowCount, config.features.expandable),
      );
    }
  }, [config.rowCount, config.features.expandable, config.dataSize]);

  // Generate columns based on config
  const smallColumns = React.useMemo((): ColumnDef<SmallData, any>[] => {
    if (config.dataSize !== "small") {
      return [];
    }

    const columnHelper = createColumnHelper<SmallData>();
    const columnDefs: ColumnDef<SmallData, any>[] = [];

    // Add selection column if enabled
    if (config.features.selectable) {
      columnDefs.push({
        id: "select",
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      });
    }

    // Add drag handle column if enabled
    if (config.features.draggable) {
      columnDefs.push({
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
      });
    }

    // Add expand column if enabled
    if (config.features.expandable) {
      columnDefs.push({
        id: "expand",
        size: 150,
        cell: ({ row }) => (
          <div
            style={{
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
      });
    }

    // Add ID column
    columnDefs.push(
      columnHelper.accessor("id", {
        id: "id",
        cell: (info) => info.getValue(),
      }),
    );

    // Generate additional columns based on config.columnCount
    if (config.features.columnGroups) {
      // Add columns with grouping
      columnDefs.push(
        columnHelper.group({
          id: "name-stuff",
          footer: () => "Name stuff",
          columns: [
            columnHelper.accessor("firstName", {
              id: "first-name",
              cell: (info) => info.getValue(),
            }),
            columnHelper.accessor("lastName", {
              id: "last-name",
              cell: (info) => info.getValue(),
            }),
          ],
        }),
      );

      // Add additional columns if needed
      if (config.columnCount > 4) {
        for (let i = 4; i < config.columnCount; i++) {
          columnDefs.push(
            columnHelper.accessor(() => `Column ${i}`, {
              id: `column-${i}`,
              header: `Column ${i}`,
              cell: (info) => info.getValue(),
            }),
          );
        }
      }
    } else {
      // Add individual columns without grouping
      columnDefs.push(
        columnHelper.accessor("firstName", {
          id: "first-name",
          cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("lastName", {
          id: "last-name",
          cell: (info) => info.getValue(),
        }),
      );

      // Add additional columns if needed
      if (config.columnCount > 4) {
        for (let i = 4; i < config.columnCount; i++) {
          columnDefs.push(
            columnHelper.accessor(() => `Column ${i}`, {
              id: `column-${i}`,
              header: `Column ${i}`,
              cell: (info) => info.getValue(),
            }),
          );
        }
      }
    }

    return columnDefs;
  }, [config.columnCount, config.features, config.dataSize]);

  const [smallColumnOrder, setSmallColumnOrder] =
    React.useState<ColumnOrderState>(() => iterateOverColumns(smallColumns));

  // Update column order when columns change
  React.useEffect(() => {
    if (config.dataSize === "small" && smallColumns.length > 0) {
      setSmallColumnOrder(iterateOverColumns(smallColumns));
    }
  }, [smallColumns, config.dataSize]);

  const getSmallSubRows = (row: SmallData) => {
    return config.features.expandable ? row.children : [];
  };

  // Create small table instance
  const smallTable = useReactTable({
    data: smallData,
    columns: smallColumns,
    state: {
      columnOrder: smallColumnOrder,
    },
    getRowId(originalRow) {
      return originalRow.id;
    },
    onColumnOrderChange: setSmallColumnOrder,
    defaultColumn: {
      minSize: 60,
      maxSize: 800,
    },
    columnResizeMode: "onChange",
    getRowCanExpand: () => config.features.expandable,
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSubRows: getSmallSubRows,
    enableRowSelection: config.features.selectable,
  });

  // Return the appropriate table based on config
  if (config.dataSize === "big") {
    return bigTableResult;
  } else {
    return {
      data: smallData,
      setData: setSmallData,
      columnOrder: smallColumnOrder,
      setColumnOrder: setSmallColumnOrder,
      table: smallTable,
      getSubRows: getSmallSubRows,
    };
  }
};
