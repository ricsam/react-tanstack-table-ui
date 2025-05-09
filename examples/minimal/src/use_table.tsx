import {
  Cell,
  Header,
  decorateColumnHelper,
  iterateOverColumns,
} from "@rttui/core";
import { User, generateTableData } from "@rttui/fixtures";
import {
  ColumnDef,
  ColumnOrderState,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";

export const useTable = () => {
  const columns = React.useMemo(() => {
    const columnHelper = decorateColumnHelper(createColumnHelper<User>(), {
      header: (original) => (
        <Header pinButtons resizer>
          {original}
        </Header>
      ),
    });

    const columns: ColumnDef<User, any>[] = [
      // Combined column with all controls
      columnHelper.accessor("fullName", {
        header: () => (
          <Header checkbox>
            Full Name
          </Header>
        ),
        cell: ({ getValue }) => (
          <Cell checkbox expandButton pinButtons>
            {getValue()}
          </Cell>
        ),
        id: "full-name",
        size: 300, // Increased size to accommodate all controls
      }),

      // Rest of the columns
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue(),
        id: "email",
        size: 200,
      }),
      columnHelper.accessor("location", {
        header: "Location",
        cell: (info) => info.getValue(),
        id: "location",
        size: 200,
      }),
      columnHelper.accessor("city", {
        header: "City",
        cell: (info) => info.getValue(),
        id: "city",
        size: 150,
      }),
      columnHelper.accessor("address", {
        header: "Address",
        cell: (info) => info.getValue(),
        id: "address",
        size: 200,
      }),
      columnHelper.group({
        id: "country-stuff",
        footer: () => "Country stuff",
        columns: [
          columnHelper.accessor("country", {
            header: "Country",
            cell: (info) => info.getValue(),
            id: "country",
          }),
          columnHelper.accessor("continent", {
            header: "Continent",
            cell: (info) => info.getValue(),
            id: "continent",
            size: 200,
          }),
          columnHelper.accessor("countryCode", {
            header: "Country Code",
            cell: (info) => info.getValue(),
            id: "country-code",
            size: 200,
          }),
          columnHelper.accessor("language", {
            header: "Language",
            cell: (info) => info.getValue(),
            id: "language",
            size: 200,
          }),
        ],
      }),
      columnHelper.accessor("favoriteGame", {
        header: "Favorite Game",
        cell: (info) => info.getValue(),
        id: "favorite-game",
        size: 200,
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
          }),
          columnHelper.accessor("birthYear", {
            header: "Birth Year",
            cell: (info) => info.getValue(),
            id: "birth-year",
            size: 120,
          }),
        ],
      }),
      columnHelper.accessor("isActive", {
        header: "Active",
        cell: (info) => (info.getValue() ? "Yes" : "No"),
        id: "is-active",
        size: 100,
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
      columnHelper.accessor("experienceYears", {
        header: "Experience (Years)",
        cell: (info) => info.getValue(),
        id: "experience-years",
        size: 150,
      }),
      columnHelper.accessor("rating", {
        header: "Rating",
        cell: (info) => info.getValue().toFixed(1),
        id: "rating",
        size: 100,
      }),
      columnHelper.accessor("completedProjects", {
        header: "Completed Projects",
        cell: (info) => info.getValue(),
        id: "completed-projects",
        size: 150,
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
          }),
          columnHelper.accessor("jobTitle", {
            header: "Job Title",
            cell: (info) => info.getValue(),
            id: "job-title",
            size: 200,
          }),
          columnHelper.accessor("teamName", {
            header: "Team",
            cell: (info) => info.getValue(),
            id: "team-name",
            size: 120,
          }),
          columnHelper.accessor("salary", {
            header: "Salary",
            cell: (info) => `$${info.getValue().toLocaleString()}`,
            id: "salary",
            size: 120,
          }),
          columnHelper.accessor("hireDate", {
            header: "Hire Date",
            cell: (info) => info.getValue(),
            id: "hire-date",
            size: 120,
          }),
          columnHelper.accessor("phoneNumber", {
            header: "Phone Number",
            cell: (info) => info.getValue(),
            id: "phone-number",
            size: 150,
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
          }),
        ],
      }),
    ];

    return columns;
  }, []);

  const [data, setData] = React.useState<User[]>(() =>
    // Use a fixed seed for consistent test data
    generateTableData({ maxRows: 5000, seed: 12345 }),
  );

  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(() =>
    iterateOverColumns(columns),
  );
  const getSubRows = (row: User) => {
    return row.otherCountries;
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder,
      // Store ID in columnVisibility to hide it
      columnVisibility: {
        id: false,
      },
    },
    getRowId(originalRow) {
      return String(originalRow.id);
    },
    onColumnOrderChange: setColumnOrder,
    defaultColumn: {
      minSize: 60,
      maxSize: 800,
    },
    enableColumnPinning: true,
    columnResizeMode: "onChange",
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSubRows,
    enableRowSelection: true,
    keepPinnedRows: true,
  });
  return { data, setData, columnOrder, setColumnOrder, table, getSubRows };
};
