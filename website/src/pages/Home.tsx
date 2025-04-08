import logoFullDark from "@/assets/logos/logo-full-dark.svg";
import logoFullLight from "@/assets/logos/logo-full-light.svg";
import { useTheme } from "@/contexts/use_theme";
import {
  decorateColumnHelper,
  ReactTanstackTableUi,
  useTableContext,
} from "@rttui/core";
import {
  Cell,
  CellBadge,
  CellCurrency,
  CellText,
  Checkbox,
  darkModeVars,
  HeaderPinButtons,
  lightModeVars,
  Resizer,
  TailwindSkin,
} from "@rttui/skin-tailwind";
import { Link } from "@tanstack/react-router";
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import React, {
  useCallback,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from "react";
import useMeasure from "react-use-measure";

// Function to generate random data
const generateRowData = (rowIndex: number) => {
  const statuses = ["Active", "Inactive", "Pending"];
  const roles = ["Admin", "Editor", "Viewer", "User", "Manager"];
  const performanceScores = [
    { score: 95, label: "Excellent" },
    { score: 75, label: "Good" },
    { score: 50, label: "Average" },
    { score: 25, label: "Poor" },
  ];

  // Choose a performance score based on row index
  const performance = performanceScores[rowIndex % performanceScores.length];

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
    performance: performance,
    // More fields can be dynamically added based on column count
  };
};

type Person = ReturnType<typeof generateRowData>;

export function HomePage() {
  const { theme } = useTheme();
  const logoFull = theme === "light" ? logoFullLight : logoFullDark;
  const demoSectionRef = useRef<HTMLDivElement>(null);

  // State for controlling row and column counts
  const [rowCount, setRowCount] = useState(300);
  const [columnCount, setColumnCount] = useState(40);

  // Measure the table container size
  const [tableContainerRef, tableContainerBounds] = useMeasure({
    debounce: 50,
    scroll: false,
  });

  const deferredRowCount = useDeferredValue(rowCount);
  // Generate rows based on rowCount
  const data = useMemo(() => {
    return Array.from({ length: deferredRowCount }, (_, i) =>
      generateRowData(i + 1),
    );
  }, [deferredRowCount]);

  const deferredColumnCount = useDeferredValue(columnCount);

  // Generate columns based on columnCount
  const columns = useMemo(() => {
    const columnHelper = decorateColumnHelper(createColumnHelper<Person>(), {
      header: (original, props) => (
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1">{original}</div>
          <HeaderPinButtons header={props.header} />
          <Resizer header={props.header} />
        </div>
      ),
    });

    // Basic columns that always exist
    const baseColumns: ColumnDef<Person, any>[] = [
      columnHelper.accessor("name", {
        header: ({ table }) => (
          <div className="flex items-center gap-2.5">
            <Checkbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
              }}
            />

            <span>Name</span>
          </div>
        ),
        cell: ({ row, getValue }) => (
          <Cell row={row} highlightSelected checkbox expandButton pinButtons>
            {getValue()}
          </Cell>
        ),
        id: "name",
        size: 300, // Increased size to accommodate all controls
      }),
      columnHelper.accessor("email", {
        id: "email",
        header: "Email",
        cell: (info) => <CellText>{info.getValue()}</CellText>,
      }),
      columnHelper.accessor("role", {
        id: "role",
        header: "Role",
        cell: (info) => <CellText>{info.getValue()}</CellText>,
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
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
        cell: (info) => <CellText>{info.getValue()}</CellText>,
      }),
      columnHelper.accessor("performance", {
        id: "performance",
        header: "Performance",
        meta: {
          autoCrush: false,
        },
        cell: (info) => {
          const performance = info.getValue();
          const color =
            performance.score >= 80
              ? "green"
              : performance.score >= 60
                ? "blue"
                : performance.score >= 40
                  ? "yellow"
                  : "red";

          return (
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  color === "green"
                    ? "bg-green-500"
                    : color === "blue"
                      ? "bg-blue-500"
                      : color === "yellow"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                }`}
              />
              <CellText>{performance.label}</CellText>
            </div>
          );
        },
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
      columnHelper.group({
        id: "group_user_info",
        header: "User Information",
        columns: baseColumns.slice(0, 2),
      }),
      columnHelper.group({
        id: "group_access_details",
        header: "Access Details",
        columns: baseColumns.slice(2, 4),
      }),
      columnHelper.group({
        id: "group_employment_info",
        header: "Employment Info",
        columns: baseColumns.slice(4),
      }),
    ];

    return groupedColumns;
  }, [deferredColumnCount]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getRowId: (row: Person) => row.id,
    enableColumnPinning: true,
    enableRowSelection: true,
    enableRowPinning: true,
    defaultColumn: {
      size: 100,
    },
    initialState: {
      columnSizing: {
        name: 196.6640625,
        email: 182.890625,
        role: 77.0859375,
        status: 83.9921875,
        age: 35.09375,
        performance: 156.7,
        salary: 97.0546875,
        department: 61.1875,
        startDate: 99.9765625,
        salary_2: 97.0546875,
        department_2: 61.1875,
      },
      columnSizingInfo: {
        startOffset: null,
        startSize: null,
        deltaOffset: null,
        deltaPercentage: null,
        isResizingColumn: false,
        columnSizingStart: [],
      },
      rowSelection: {},
      rowPinning: {
        top: ["7"],
        bottom: ["9"],
      },
      expanded: {
        "4": true,
        "10": true,
      },
      grouping: [],
      sorting: [],
      columnFilters: [],
      columnPinning: {
        left: ["email"],
        right: ["salary"],
      },
      columnOrder: [],
      columnVisibility: {},
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
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

  const [innerContainerSizeRef, innerContainerSize] = useMeasure({
    debounce: 100,
    scroll: false,
  });

  const scrollToDemoSection = useCallback(() => {
    demoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
              <div className="rounded-md whitespace-nowrap">
                <Link
                  to="/docs/getting-started"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:text-white dark:bg-primary-600 dark:hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                >
                  Get started
                </Link>
              </div>
              <div className="mt-3 rounded-md whitespace-nowrap sm:mt-0 sm:ml-3">
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

            {/* Scroll down button - moved to bottom of hero with animation */}
            <div className="mt-16 flex justify-center">
              <button
                onClick={scrollToDemoSection}
                className="group flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500 transition-colors"
              >
                <span className="text-sm font-medium pb-2">
                  See it in action
                </span>
                <div className="animate-bounce bg-primary-600 dark:bg-primary-500 p-2 w-10 h-10 ring-1 ring-primary-700 dark:ring-primary-600 shadow-lg rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                  </svg>
                </div>
              </button>
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
      <div ref={demoSectionRef} className="py-16 bg-white dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
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
          <div className="mb-8 flex flex-col md:flex-row gap-8 justify-center max-w-7xl mx-auto">
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
              {tableContainerBounds.width && tableContainerBounds.height ? (
                <ReactTanstackTableUi
                  table={table}
                  width={tableContainerBounds.width}
                  height={tableContainerBounds.height}
                  skin={TailwindSkin}
                  autoCrushColumns
                  crushMinSizeBy="header"
                  underlay={
                    <div
                      style={{
                        position: "absolute",
                        pointerEvents: "none",
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        zIndex: -1,
                        visibility: "hidden",
                      }}
                      ref={innerContainerSizeRef}
                    ></div>
                  }
                  renderSubComponent={({ row }) => {
                    return (
                      <Details row={row} width={innerContainerSize.width} />
                    );
                  }}
                />
              ) : null}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/examples"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white dark:text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700"
            >
              Explore more examples
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Details({ row, width }: { row: Row<Person>; width: number }) {
  const person = row.original;
  const { table } = useTableContext();
  return (
    <div
      className="px-6 pb-6 bg-white dark:bg-gray-800 ring-1 ring-gray-900/5 w-full border-t border-gray-200 dark:border-gray-700 sticky"
      style={{
        width: width - table.getLeftTotalSize() - table.getRightTotalSize(),
        left: table.getLeftTotalSize(),
      }}
    >
      <div className="flex items-start gap-6">
        {/* Content container */}
        <div className="flex-1 min-w-0">
          {/* Header with name, email and status */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {person.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {person.email}
              </p>
            </div>
            <div
              className={`rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                person.status === "Active"
                  ? "bg-green-50 text-green-600 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400"
                  : person.status === "Inactive"
                    ? "bg-red-50 text-red-600 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400"
                    : "bg-yellow-50 text-yellow-600 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-400"
              }`}
            >
              {person.status}
            </div>
          </div>

          {/* Main information grid */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-6 gap-x-8 gap-y-4">
              {/* Role info */}
              <div className="col-span-1 flex items-start gap-2">
                <div className="flex-none mt-0.5">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-3 w-3 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                      />
                    </svg>
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Role
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {person.role}
                  </p>
                </div>
              </div>

              {/* Department info */}
              <div className="col-span-1 flex items-start gap-2">
                <div className="flex-none mt-0.5">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-3 w-3 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                      />
                    </svg>
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Department
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {person.department}
                  </p>
                </div>
              </div>

              {/* Start date info */}
              <div className="col-span-1 flex items-start gap-2">
                <div className="flex-none mt-0.5">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-3 w-3 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Start Date
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {person.startDate}
                  </p>
                </div>
              </div>

              {/* Age info */}
              <div className="col-span-1 flex items-start gap-2">
                <div className="flex-none mt-0.5">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-3 w-3 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z"
                      />
                    </svg>
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Age
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {person.age}
                  </p>
                </div>
              </div>

              {/* Salary info */}
              <div className="col-span-1 flex items-start gap-2">
                <div className="flex-none mt-0.5">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-3 w-3 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Salary
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${person.salary.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* ID info */}
              <div className="col-span-1 flex items-start gap-2">
                <div className="flex-none mt-0.5">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-3 w-3 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                      />
                    </svg>
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ID</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    #{person.id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance section and actions */}
          <div className="grid grid-cols-4 gap-x-8 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="col-span-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  Performance
                </span>
                <span
                  className={`
                  ${
                    person.performance.score >= 80
                      ? "text-green-600 dark:text-green-400"
                      : person.performance.score >= 60
                        ? "text-blue-600 dark:text-blue-400"
                        : person.performance.score >= 40
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                  }
                `}
                >
                  {person.performance.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    person.performance.score >= 80
                      ? "bg-green-500"
                      : person.performance.score >= 60
                        ? "bg-blue-500"
                        : person.performance.score >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                  }`}
                  style={{
                    width: `${person.performance.score}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="col-span-1 flex items-center justify-end space-x-2">
              <button className="inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-2 py-1 text-xs font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                Details
              </button>
              <button className="inline-flex items-center rounded-md bg-primary-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-primary-500">
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
