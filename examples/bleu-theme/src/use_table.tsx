import { decorateColumnHelper } from "@rttui/core";
import { generateTableData, User } from "@rttui/fixtures";
import {
  Cell,
  Filter,
  Header,
  SpreadsheetColHeader,
  SpreadsheetRowHeader,
} from "@rttui/skin-bleu";
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowData,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { CountrySelect } from "./country_select";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    accessorKey?: string;
    formatValue?: (value: string) => any;
  }
}

const columnHelper = decorateColumnHelper(createColumnHelper<User>(), {
  header: (original, context) => (
    <Header
      options
      accessibleResizer
      sorting
      checkbox={context.column.id.endsWith("full-name")}
      resizer
    >
      {original}
    </Header>
  ),
  filter: () => <Filter resizer />,
  extraHeaders: [
    {
      id: "spreadsheet-col-header",
      header: (props) => {
        const tableColIndex = props.column.getIndex();
        return <SpreadsheetColHeader tableColIndex={tableColIndex} />;
      },
      meta: {
        disablePadding: true,
      },
    },
  ],
  cell: (original, context) => {
    if (context.column.columnDef.meta?.isSpreadsheetRowHeader) {
      return original;
    }
    return (
      <Cell
        {...(context.column.id.endsWith("full-name")
          ? { checkbox: true, expandButton: true, pinButtons: true }
          : {})}
        resizer
      >
        {original}
      </Cell>
    );
  },
});

const columns: ColumnDef<User, any>[] = [
  columnHelper.display({
    id: "spreadsheet-row-header",
    cell: (info) => <SpreadsheetRowHeader index={info.row.index} />,
    enablePinning: true,
    meta: {
      isSpreadsheetRowHeader: true,
    },
  }),

  // Combined column with all controls
  columnHelper.accessor("fullName", {
    header: "Full Name",
    cell: (info) => info.getValue(),
    id: "full-name",
    size: 300, // Increased size to accommodate all controls
    meta: {
      accessorKey: "fullName",
    },
  }),

  // Rest of the columns
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue(),
    id: "email",
    size: 200,
    meta: {
      accessorKey: "email",
    },
  }),

  columnHelper.accessor("experienceYears", {
    header: "Experience (Years)",
    cell: (info) => info.getValue(),
    footer: ({ table }) => {
      const total = table
        .getFilteredRowModel()
        .flatRows.reduce((acc, row) => acc + row.original.experienceYears, 0);
      return <span>Total experience: {total}</span>;
    },
    id: "experience-years",
    size: 150,
    meta: {
      accessorKey: "experienceYears",
      formatValue: (value) => Number(value),
    },
  }),
  columnHelper.group({
    id: "state",
    header: () => "State",
    columns: [
      columnHelper.accessor<"country", string>("country", {
        header: "Country",
        cell: (info) => info.getValue(),
        id: "country",
        meta: {
          accessorKey: "country",
          renderInput: (value, selectionManager, cell) => (
            <CountrySelect
              value={value}
              selectionManager={selectionManager}
              cell={cell}
            />
          ),
        },
      }),
      columnHelper.accessor("continent", {
        header: "Continent",
        cell: (info) => info.getValue(),
        id: "continent",
        size: 200,
        meta: {
          accessorKey: "continent",
        },
      }),
      columnHelper.accessor("countryCode", {
        header: "Country Code",
        cell: (info) => info.getValue(),
        id: "country-code",
        size: 200,
        meta: {
          accessorKey: "countryCode",
        },
      }),
    ],
  }),
  columnHelper.accessor("location", {
    header: "Location",
    cell: (info) => info.getValue(),
    id: "location",
    size: 200,
    meta: {
      accessorKey: "location",
    },
  }),
  columnHelper.accessor("city", {
    header: "City",
    cell: (info) => info.getValue(),
    id: "city",
    size: 150,
    meta: {
      accessorKey: "city",
    },
  }),
  columnHelper.accessor("address", {
    header: "Address",
    cell: (info) => info.getValue(),
    id: "address",
    size: 200,
    meta: {
      accessorKey: "address",
    },
  }),
  columnHelper.accessor("language", {
    header: "Language",
    cell: (info) => info.getValue(),
    id: "language",
    size: 200,
    meta: {
      accessorKey: "language",
    },
  }),
  columnHelper.accessor("favoriteGame", {
    header: "Favorite Game",
    cell: (info) => info.getValue(),
    id: "favorite-game",
    size: 200,
    meta: {
      accessorKey: "favoriteGame",
    },
  }),
  columnHelper.group({
    header: "Birth Info",
    id: "birth-info",
    columns: [
      columnHelper.accessor("birthMonth", {
        header: "Birth Month",
        cell: (info) => info.getValue(),
        id: "birth-month",
        size: 120,
        meta: {
          accessorKey: "birthMonth",
        },
      }),
      columnHelper.accessor("birthYear", {
        header: "Birth Year",
        cell: (info) => info.getValue(),
        id: "birth-year",
        size: 120,
        meta: {
          accessorKey: "birthYear",
        },
      }),
    ],
  }),
  columnHelper.accessor("isActive", {
    header: "Active",
    cell: (info) => (info.getValue() ? "Yes" : "No"),
    id: "is-active",
    size: 100,
    meta: {
      accessorKey: "isActive",
    },
  }),
  columnHelper.group({
    header: "Winnings",
    id: "winnings",
    columns: [
      columnHelper.accessor((data) => data.yearlyWinnings[2019], {
        id: "winnings-2019",
        header: "2019",
        cell: (info) => `$${info.getValue().toLocaleString()}`,
        size: 120,
      }),
      columnHelper.accessor((data) => data.yearlyWinnings[2020], {
        id: "winnings-2020",
        header: "2020",
        cell: (info) => `$${info.getValue().toLocaleString()}`,
        size: 120,
      }),
      columnHelper.accessor((data) => data.yearlyWinnings[2021], {
        id: "winnings-2021",
        header: "2021",
        cell: (info) => `$${info.getValue().toLocaleString()}`,
        size: 120,
      }),
      columnHelper.accessor((data) => data.yearlyWinnings[2022], {
        id: "winnings-2022",
        header: "2022",
        cell: (info) => `$${info.getValue().toLocaleString()}`,
        size: 120,
      }),
      columnHelper.accessor((data) => data.yearlyWinnings[2023], {
        id: "winnings-2023",
        header: "2023",
        cell: (info) => `$${info.getValue().toLocaleString()}`,
        size: 120,
      }),
      columnHelper.accessor((data) => data.yearlyWinnings[2024], {
        id: "winnings-2024",
        header: "2024",
        cell: (info) => `$${info.getValue().toLocaleString()}`,
        size: 120,
      }),
    ],
  }),
  columnHelper.accessor("rating", {
    header: "Rating",
    cell: (info) => info.getValue().toFixed(1),
    id: "rating",
    size: 100,
    meta: {
      accessorKey: "rating",
    },
  }),
  columnHelper.accessor("completedProjects", {
    header: "Completed Projects",
    cell: (info) => info.getValue(),
    id: "completed-projects",
    size: 150,
    meta: {
      accessorKey: "completedProjects",
    },
  }),
  columnHelper.group({
    header: "Employment Info",
    id: "employment-info",
    columns: [
      columnHelper.accessor("department", {
        header: "Department",
        cell: (info) => info.getValue(),
        id: "department",
        size: 150,
        meta: {
          accessorKey: "department",
        },
      }),
      columnHelper.accessor("jobTitle", {
        header: "Job Title",
        cell: (info) => info.getValue(),
        id: "job-title",
        size: 200,
        meta: {
          accessorKey: "jobTitle",
        },
      }),
      columnHelper.accessor("teamName", {
        header: "Team",
        cell: (info) => info.getValue(),
        id: "team-name",
        size: 120,
        meta: {
          accessorKey: "jobTitle",
        },
      }),
      columnHelper.accessor("salary", {
        header: "Salary",
        cell: (info) => `$${info.getValue().toLocaleString()}`,
        id: "salary",
        size: 120,
        meta: {
          accessorKey: "salary",
        },
      }),
      columnHelper.accessor("hireDate", {
        header: "Hire Date",
        cell: (info) => info.getValue(),
        id: "hire-date",
        size: 120,
        meta: {
          accessorKey: "hireDate",
        },
      }),
      columnHelper.accessor("phoneNumber", {
        header: "Phone Number",
        cell: (info) => info.getValue(),
        id: "phone-number",
        size: 150,
        meta: {
          accessorKey: "phoneNumber",
        },
      }),
      columnHelper.accessor("performanceScore", {
        header: "Performance",
        cell: (info) => {
          const score = info.getValue();
          const stars = "★".repeat(score) + "☆".repeat(5 - score);
          return <span title={`${score}/5`}>{stars}</span>;
        },
        id: "performance-score",
        size: 120,
        meta: {
          accessorKey: "performanceScore",
        },
      }),
    ],
  }),
];

const getSubRows = (row: User) => {
  return row.otherCountries;
};

export const useTable = () => {
  const [data, setData] = React.useState(() =>
    generateTableData({ maxRows: 5000, seed: 12345 }),
  );
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableColumnFilters: true,
    getFilteredRowModel: getFilteredRowModel(),
    enableRowPinning: true,
    enableColumnPinning: true,
    columnResizeMode: "onChange",
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSubRows,
    enableRowSelection: true,
    keepPinnedRows: true,
    enableSorting: true,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnPinning: {
        left: [
          "_decorator_extra_header_0__decorator_filter_spreadsheet-row-header",
        ],
      },
    },
  });
  return { table, data, setData };
};
