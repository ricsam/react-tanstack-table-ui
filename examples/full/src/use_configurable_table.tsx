import {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  SortingState,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { Filter } from "./filter_components";
import { IndeterminateCheckbox } from "./indeterminate_checkbox";
import { RowDragHandleCell } from "./row_drag_handle_cell";
import { TableConfig } from "./table_config";
import { useBigTable } from "./use_big_table";
import { SortIndicator } from "./sort_indicator";

// Import types from SmallData from use_small_table
type SmallData = {
  id: string;
  firstName: string;
  lastName: string;
  children: SmallData[];
  status?: "active" | "inactive" | "pending";
  age?: number;
  rating?: number;
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

  // State for sorting and filtering
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

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

    const statuses = ["active", "inactive", "pending"] as const;

    return Array.from({ length: count }).map((_, i) => ({
      id: (i + 1).toString(),
      firstName: firstNames[i % firstNames.length],
      lastName: lastNames[i % lastNames.length],
      status: statuses[i % statuses.length],
      age: 20 + (i % 50),
      rating: Math.floor(Math.random() * 50 + 50) / 10,
      children:
        withChildren && i < 2
          ? [
              {
                id: `${i + 1}.1`,
                firstName: firstNames[(i + 3) % firstNames.length],
                lastName: lastNames[(i + 3) % lastNames.length],
                status: statuses[(i + 1) % statuses.length],
                age: 20 + ((i + 1) % 50),
                rating: Math.floor(Math.random() * 50 + 50) / 10,
                children: [],
              },
              {
                id: `${i + 1}.2`,
                firstName: firstNames[(i + 4) % firstNames.length],
                lastName: lastNames[(i + 4) % lastNames.length],
                status: statuses[(i + 2) % statuses.length],
                age: 20 + ((i + 2) % 50),
                rating: Math.floor(Math.random() * 50 + 50) / 10,
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

    // Create a consistent header render function to reuse across columns
    const createHeaderCell = (
      title: string,
      filterVariant: "text" | "select" | "range" = "text",
    ) => {
      return ({ column }: { column: any }) => (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            padding: "8px 0",
            gap: 4,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              cursor: config.features.sorting ? "pointer" : "default",
              padding: "4px 0",
              fontWeight: "bold",
            }}
            onClick={
              config.features.sorting
                ? column.getToggleSortingHandler()
                : undefined
            }
          >
            {title}
            {config.features.sorting && (
              <SortIndicator sorted={column.getIsSorted()} />
            )}
          </div>
          {config.features.filtering && column.getCanFilter() && (
            <div style={{ marginTop: "6px", width: "100%" }}>
              <Filter column={column} variant={filterVariant} />
            </div>
          )}
        </div>
      );
    };

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
        header: createHeaderCell("ID", "text"),
      }),
    );

    // Generate additional columns based on config.columnCount
    if (config.features.columnGroups) {
      // Add columns with grouping
      columnDefs.push(
        columnHelper.group({
          id: "name-stuff",
          header: "Name",
          footer: () => "Name",
          columns: [
            columnHelper.accessor("firstName", {
              id: "first-name",
              cell: (info) => info.getValue(),
              header: createHeaderCell("First Name", "text"),
              enableSorting: config.features.sorting,
              enableColumnFilter: config.features.filtering,
            }),
            columnHelper.accessor("lastName", {
              id: "last-name",
              cell: (info) => info.getValue(),
              header: createHeaderCell("Last Name", "text"),
              enableSorting: config.features.sorting,
              enableColumnFilter: config.features.filtering,
            }),
          ],
        }),
      );

      // Add status column
      columnDefs.push(
        columnHelper.accessor("status", {
          id: "status",
          cell: (info) => info.getValue(),
          header: createHeaderCell("Status", "select"),
          enableSorting: config.features.sorting,
          enableColumnFilter: config.features.filtering,
        }),
      );

      // Add age column
      columnDefs.push(
        columnHelper.accessor("age", {
          id: "age",
          cell: (info) => info.getValue(),
          header: createHeaderCell("Age", "range"),
          enableSorting: config.features.sorting,
          enableColumnFilter: config.features.filtering,
        }),
      );

      // Add rating column
      columnDefs.push(
        columnHelper.accessor("rating", {
          id: "rating",
          cell: (info) => info.getValue()?.toFixed(1),
          header: createHeaderCell("Rating", "range"),
          enableSorting: config.features.sorting,
          enableColumnFilter: config.features.filtering,
        }),
      );

      // Add additional columns if needed
      if (config.columnCount > 7) {
        for (let i = 7; i < config.columnCount; i++) {
          columnDefs.push(
            columnHelper.accessor(() => `Column ${i}`, {
              id: `column-${i}`,
              header: createHeaderCell(`Column ${i}`, "text"),
              cell: (info) => info.getValue(),
              enableSorting: config.features.sorting,
              enableColumnFilter: config.features.filtering,
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
          header: createHeaderCell("First Name", "text"),
          enableSorting: config.features.sorting,
          enableColumnFilter: config.features.filtering,
        }),
        columnHelper.accessor("lastName", {
          id: "last-name",
          cell: (info) => info.getValue(),
          header: createHeaderCell("Last Name", "text"),
          enableSorting: config.features.sorting,
          enableColumnFilter: config.features.filtering,
        }),
        columnHelper.accessor("status", {
          id: "status",
          cell: (info) => info.getValue(),
          header: createHeaderCell("Status", "select"),
          enableSorting: config.features.sorting,
          enableColumnFilter: config.features.filtering,
        }),
        columnHelper.accessor("age", {
          id: "age",
          cell: (info) => info.getValue(),
          header: createHeaderCell("Age", "range"),
          enableSorting: config.features.sorting,
          enableColumnFilter: config.features.filtering,
        }),
      );

      // Add additional columns if needed
      if (config.columnCount > 5) {
        for (let i = 5; i < config.columnCount; i++) {
          columnDefs.push(
            columnHelper.accessor(() => `Column ${i}`, {
              id: `column-${i}`,
              header: createHeaderCell(`Column ${i}`, "text"),
              cell: (info) => info.getValue(),
              enableSorting: config.features.sorting,
              enableColumnFilter: config.features.filtering,
            }),
          );
        }
      }
    }

    return columnDefs;
  }, [config.columnCount, config.features, config.dataSize]);

  const [smallColumnOrder, setSmallColumnOrder] =
    React.useState<ColumnOrderState>(() => iterateOverColumns(smallColumns));

  const smallColumnsRef = React.useRef(smallColumns);
  smallColumnsRef.current = smallColumns;

  // Update column order when columns change
  React.useEffect(() => {
    if (config.dataSize === "small" && smallColumnsRef.current.length > 0) {
      setSmallColumnOrder(iterateOverColumns(smallColumnsRef.current));
    }
  }, [config.dataSize]);

  const getSmallSubRows = (row: SmallData) => {
    return config.features.expandable ? row.children : [];
  };

  // Create small table instance
  const smallTable = useReactTable({
    data: smallData,
    columns: smallColumns,
    state: {
      columnOrder: smallColumnOrder,
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getRowId(originalRow) {
      return originalRow.id;
    },
    onColumnOrderChange: setSmallColumnOrder,
    defaultColumn: {
      minSize: config.features.filtering ? 300 : 150,
      size: 200,
      maxSize: 800,
    },
    columnResizeMode: "onChange",
    getRowCanExpand: () => config.features.expandable,
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
