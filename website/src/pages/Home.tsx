import logoFullDark from "@/assets/logos/logo-full-dark.svg";
import logoFullLight from "@/assets/logos/logo-full-light.svg";
import { useTheme } from "@/contexts/use_theme";
import { ReactTanstackTableUi } from "@rttui/core";
import {
  CellBadge,
  CellCurrency,
  CellText,
  CellTextBold,
  TailwindSkin,
  darkModeVars,
  lightModeVars,
} from "@rttui/skin-tailwind";
import { Link } from "@tanstack/react-router";
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useCallback, useDeferredValue, useMemo, useState } from "react";
import useMeasure from "react-use-measure";

// Function to generate random data
const generateRowData = (rowIndex: number) => {
  const statuses = ["Active", "Inactive", "Pending"];
  const roles = ["Admin", "Editor", "Viewer", "User", "Manager"];

  return {
    id: `${rowIndex}`,
    name: `Person ${rowIndex}`,
    email: `person${rowIndex}@example.com`,
    role: roles[rowIndex % roles.length],
    status: statuses[rowIndex % statuses.length],
    age: 20 + (rowIndex % 50),
    salary: 30000 + ((rowIndex * 500) % 120000),
    department: `Dept ${Math.floor(rowIndex / 10) % 10}`,
    startDate: new Date(2020, rowIndex % 12, (rowIndex % 28) + 1)
      .toISOString()
      .split("T")[0],
    // More fields can be dynamically added based on column count
  };
};

export function HomePage() {
  const { theme } = useTheme();
  const logoFull = theme === "light" ? logoFullLight : logoFullDark;

  // State for controlling row and column counts
  const [rowCount, setRowCount] = useState(100);
  const [columnCount, setColumnCount] = useState(10);

  // Measure the table container size
  const [tableContainerRef, tableContainerBounds] = useMeasure({
    debounce: 50,
    scroll: false,
  });

  // Calculate table dimensions - using 16:9 aspect ratio (width * 9/16)
  const tableWidth = tableContainerBounds.width || 800;
  const tableHeight = tableWidth * (9 / 16);

  const deferredRowCount = useDeferredValue(rowCount);
  // Generate rows based on rowCount
  const data = useMemo(() => {
    return Array.from({ length: deferredRowCount }, (_, i) =>
      generateRowData(i + 1),
    );
  }, [deferredRowCount]);

  type Person = (typeof data)[0];

  const deferredColumnCount = useDeferredValue(columnCount);

  // Generate columns based on columnCount
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Person>();

    // Basic columns that always exist
    const baseColumns: ColumnDef<Person, any>[] = [
      columnHelper.accessor("name", {
        id: "name",
        header: "Name",
        footer: "Name",
        cell: (info) => <CellTextBold>{info.getValue()}</CellTextBold>,
      }),
      columnHelper.accessor("email", {
        id: "email",
        header: "Email",
        footer: "Email",
        cell: (info) => <CellText>{info.getValue()}</CellText>,
      }),
      columnHelper.accessor("role", {
        id: "role",
        header: "Role",
        footer: "Role",
        cell: (info) => <CellText>{info.getValue()}</CellText>,
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        footer: "Status",
        cell: (info) => (
          <CellBadge
            color={
              info.getValue() === "Active"
                ? "green"
                : info.getValue() === "Inactive"
                  ? "red"
                  : "yellow"
            }
          >
            {info.getValue()}
          </CellBadge>
        ),
      }),
      columnHelper.accessor("age", {
        id: "age",
        header: "Age",
        footer: "Age",
        cell: (info) => <CellText>{info.getValue()}</CellText>,
      }),
    ];

    // Add additional columns if needed
    if (deferredColumnCount > 5) {
      const additionalFields = [
        { id: "salary", name: "Salary" },
        { id: "department", name: "Department" },
        { id: "startDate", name: "Start Date" },
      ];

      // For each additional column beyond the base set
      for (let i = 5; i < deferredColumnCount; i++) {
        const fieldIndex = (i - 5) % additionalFields.length;
        const groupIndex = Math.floor((i - 5) / additionalFields.length);
        const field = additionalFields[fieldIndex];

        // Create a unique column ID
        const uniqueColumnId =
          groupIndex > 0 ? `${field.id}_${groupIndex + 1}` : field.id;

        baseColumns.push(
          columnHelper.accessor(field.id as any, {
            id: uniqueColumnId,
            header: `${field.name} ${groupIndex > 0 ? groupIndex + 1 : ""}`,
            footer: `${field.name} ${groupIndex > 0 ? groupIndex + 1 : ""}`,
            cell:
              field.id === "salary"
                ? (info) => <CellCurrency value={info.getValue()} />
                : (info) => <CellText>{info.getValue()}</CellText>,
          }),
        );
      }
    }

    // Add column grouping for demonstration purposes
    const groupedColumns = [
      {
        id: "group_user_info",
        header: "User Information",
        footer: "User Info Summary",
        columns: baseColumns.slice(0, 2),
      },
      {
        id: "group_access_details",
        header: "Access Details",
        footer: "Access Summary",
        columns: baseColumns.slice(2, 4),
      },
      {
        id: "group_personal_info",
        header: "Personal Info",
        footer: "Personal Summary",
        columns: baseColumns.slice(4),
      },
    ];

    return groupedColumns;
  }, [deferredColumnCount]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getRowId: (row: Person) => row.id,
    enableColumnPinning: true,
    enableRowPinning: true,
  });

  // Apply theme-specific styles
  const themeVars = theme === "light" ? lightModeVars : darkModeVars;

  // Handle slider changes
  const handleRowCountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRowCount(Number(e.target.value));
    },
    [],
  );

  const handleColumnCountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setColumnCount(Number(e.target.value));
    },
    [],
  );

  return (
    <div>
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <img
                src={logoFull}
                alt="React TanStack Table UI"
                className="h-16"
              />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">React TanStack Table UI</span>
              <span className="block text-primary-600">
                Powerful virtualized tables for React
              </span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              A collection of components and utilities for building powerful,
              customizable tables with TanStack Table and virtual scrolling
              support.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/docs/getting-started"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:text-white dark:bg-primary-600 dark:hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                >
                  Get started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <a
                  href="https://github.com/ricsam/react-tanstack-table-ui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need for complex tables
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    🚀
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    TanStack Table Integration
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  Built on top of TanStack Table v8 (formerly React Table) for
                  powerful table functionality.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    📜
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Virtual Scrolling
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  Handle large datasets efficiently with TanStack Virtual for
                  smooth scrolling performance.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    🎨
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Multiple Skins
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  Choose from pre-built Material UI or Anocca themes, or create
                  your own custom skin.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    🔌
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Extensible Architecture
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  Customizable and extensible architecture for adapting to your
                  specific needs.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Live Demo Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Live Demo
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              See it in action
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
              Experience the power and flexibility of React TanStack Table UI
              with this interactive example
            </p>
          </div>

          {/* Sliders for controlling table dimensions */}
          <div className="mb-8 flex flex-col md:flex-row gap-8 justify-center">
            <div className="w-full md:w-1/2">
              <label
                htmlFor="rowSlider"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Rows: {rowCount.toLocaleString()}
              </label>
              <input
                id="rowSlider"
                type="range"
                min="10"
                max="100000"
                step="10"
                value={rowCount}
                onChange={handleRowCountChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>10</span>
                <span>100,000</span>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <label
                htmlFor="columnSlider"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Columns: {columnCount}
              </label>
              <input
                id="columnSlider"
                type="range"
                min="5"
                max="1000"
                step="5"
                value={columnCount}
                onChange={handleColumnCountChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>5</span>
                <span>1,000</span>
              </div>
            </div>
          </div>

          {/* Table container with 16:9 aspect ratio */}
          <div
            className="w-full relative border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden aspect-video"
            style={{ ...themeVars }}
          >
            <div ref={tableContainerRef} className="absolute inset-0">
              <ReactTanstackTableUi
                table={table}
                width={tableWidth}
                height={tableHeight}
                skin={TailwindSkin}
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/examples"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700"
            >
              Explore more examples
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
