import {
  iterateOverColumns,
  ReactTanstackTableUi,
  defaultSkin,
  darkModeVars,
  lightModeVars,
} from "@rttui/core";
import { generateTableData, User } from "@rttui/fixtures";
import {
  ColumnDef,
  ColumnOrderState,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  ColumnHelper,
  CellContext,
} from "@tanstack/react-table";
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AnoccaSkin } from "@rttui/skin-anocca";
import { MuiSkin } from "@rttui/skin-mui";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Chip,
  Rating,
  Link as MuiLink,
  Typography,
  Checkbox,
  IconButton,
} from "@mui/material";
import { useHashState } from "./use_hash_state";
import {
  CheckCircle,
  Cancel,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Close,
  KeyboardArrowUp,
} from "@mui/icons-material";

interface ThemeProviderProps {
  theme?: "light" | "dark";
  children: React.ReactNode;
}

const DefaultThemeProvider: React.FC<ThemeProviderProps> = ({
  theme = "dark",
  children,
}) => {
  return (
    <div style={theme === "light" ? lightModeVars : darkModeVars}>
      {children}
    </div>
  );
};

function App() {
  const { table } = useBigTable();
  const [theme, setTheme] = useHashState<"light" | "dark">("theme", "light");
  const [skin, setSkin] = useHashState<"mui" | "anocca" | "default">(
    "skin",
    "mui",
  );

  const activeSkin = React.useMemo(() => {
    switch (skin) {
      case "mui":
        return MuiSkin;
      case "anocca":
        return AnoccaSkin;
      default:
        return defaultSkin;
    }
  }, [skin]);

  const muiTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
        },
      }),
    [theme],
  );

  return (
    <DefaultThemeProvider theme={theme}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "20px" }}>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as "light" | "dark")}
              style={{ marginRight: "10px" }}
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>

            <select
              value={skin}
              onChange={(e) =>
                setSkin(e.target.value as "mui" | "anocca" | "default")
              }
            >
              <option value="mui">Material UI Skin</option>
              <option value="anocca">Anocca Skin</option>
              <option value="default">Default Skin</option>
            </select>
          </div>

          <ReactTanstackTableUi
            width={1920}
            height={1600}
            table={table}
            getId={(row) => row.id}
            skin={activeSkin}
          />
        </div>
      </ThemeProvider>
    </DefaultThemeProvider>
  );
}

const IndeterminateCheckbox = React.memo(function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}: { indeterminate?: boolean } & React.HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!);

  React.useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
      {...rest}
    />
  );
});

// Constants for row operations
const includeLeafRows = true;
const includeParentRows = true;

// Define separate objects for default and MUI special column definitions
const defaultSpecialColumnDefs = (columnHelper: ColumnHelper<User>) => ({
  "is-active": columnHelper.accessor("isActive", {
    header: "Active",
    cell: (info: CellContext<User, boolean>) =>
      info.getValue() ? "Yes" : "No",
    id: "is-active",
    size: 100,
  }),

  "performance-score": columnHelper.accessor("performanceScore", {
    header: "Performance",
    cell: (info: CellContext<User, number>) => {
      const score = info.getValue();
      const stars = "★".repeat(score) + "☆".repeat(5 - score);
      return <span title={`${score}/5`}>{stars}</span>;
    },
    id: "performance-score",
    size: 120,
  }),

  salary: columnHelper.accessor("salary", {
    header: "Salary",
    cell: (info: CellContext<User, number>) =>
      `$${info.getValue().toLocaleString()}`,
    id: "salary",
    size: 120,
  }),

  email: columnHelper.accessor("email", {
    header: "Email",
    cell: (info: CellContext<User, string>) => info.getValue(),
    id: "email",
    size: 200,
  }),

  "full-name": columnHelper.accessor("fullName", {
    header: ({ table }) => (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Standard Select all checkbox */}
        <IndeterminateCheckbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
          }}
        />

        {/* Standard Expand all button */}
        <button onClick={table.getToggleAllRowsExpandedHandler()}>
          {table.getIsAllRowsExpanded() ? "⬇️" : "➡️"}
        </button>

        <span>Full Name</span>
      </div>
    ),
    cell: ({ row, getValue }) => (
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          paddingLeft: `${row.depth * 20}px`,
        }}
      >
        {/* Standard Selection checkbox */}
        <IndeterminateCheckbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
          }}
        />

        {/* Standard Expand/collapse button */}
        {row.getCanExpand() ? (
          <button
            onClick={row.getToggleExpandedHandler()}
            style={{ cursor: "pointer" }}
          >
            {row.getIsExpanded() ? "⬇️" : "➡️"}
          </button>
        ) : (
          <span style={{ width: "24px", display: "inline-block" }}>🔵</span>
        )}

        {/* Standard Pin buttons */}
        {row.getIsPinned() ? (
          <button
            onClick={() => row.pin(false, includeLeafRows, includeParentRows)}
          >
            ❌
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "4px",
            }}
          >
            <button
              onClick={() => row.pin("top", includeLeafRows, includeParentRows)}
            >
              ⬆️
            </button>
            <button
              onClick={() =>
                row.pin("bottom", includeLeafRows, includeParentRows)
              }
            >
              ⬇️
            </button>
          </div>
        )}

        {/* Name content */}
        <span>{getValue()}</span>
      </div>
    ),
    id: "full-name",
    size: 300,
  }),
});

const muiSpecialColumnDefs = (columnHelper: ColumnHelper<User>) => ({
  "is-active": columnHelper.accessor("isActive", {
    header: "Active",
    cell: (info: CellContext<User, boolean>) => (
      <Chip
        size="small"
        color={info.getValue() ? "success" : "error"}
        icon={
          info.getValue() ? (
            <CheckCircle fontSize="small" />
          ) : (
            <Cancel fontSize="small" />
          )
        }
        label={info.getValue() ? "Active" : "Inactive"}
      />
    ),
    id: "is-active",
    size: 100,
  }),

  "performance-score": columnHelper.accessor("performanceScore", {
    header: "Performance",
    cell: (info: CellContext<User, number>) => (
      <Rating value={info.getValue()} readOnly size="small" max={5} />
    ),
    id: "performance-score",
    size: 120,
  }),

  salary: columnHelper.accessor("salary", {
    header: "Salary",
    cell: (info: CellContext<User, number>) => (
      <Typography variant="body2">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(info.getValue())}
      </Typography>
    ),
    id: "salary",
    size: 120,
  }),

  email: columnHelper.accessor("email", {
    header: "Email",
    cell: (info: CellContext<User, string>) => (
      <MuiLink href={`mailto:${info.getValue()}`} underline="hover">
        {info.getValue()}
      </MuiLink>
    ),
    id: "email",
    size: 200,
  }),

  "full-name": columnHelper.accessor("fullName", {
    header: ({ table }) => (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* MUI Select all checkbox */}
        <Checkbox
          size="small"
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />

        {/* MUI Expand all button */}
        <IconButton
          size="small"
          onClick={table.getToggleAllRowsExpandedHandler()}
        >
          {table.getIsAllRowsExpanded() ? (
            <KeyboardArrowDown />
          ) : (
            <KeyboardArrowRight />
          )}
        </IconButton>

        <Typography variant="body1">Full Name</Typography>
      </div>
    ),
    cell: ({ row, getValue }) => (
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          paddingLeft: `${row.depth * 20}px`,
        }}
      >
        {/* MUI Selection checkbox */}
        <Checkbox
          size="small"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          indeterminate={row.getIsSomeSelected()}
          onChange={row.getToggleSelectedHandler()}
        />

        {/* MUI Expand/collapse button */}
        {row.getCanExpand() ? (
          <IconButton size="small" onClick={row.getToggleExpandedHandler()}>
            {row.getIsExpanded() ? (
              <KeyboardArrowDown />
            ) : (
              <KeyboardArrowRight />
            )}
          </IconButton>
        ) : (
          <span style={{ width: "24px", display: "inline-block" }}></span>
        )}

        {/* MUI Pin buttons */}
        {row.getIsPinned() ? (
          <IconButton
            size="small"
            onClick={() => row.pin(false, includeLeafRows, includeParentRows)}
          >
            <Close fontSize="small" />
          </IconButton>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "4px",
            }}
          >
            <IconButton
              size="small"
              onClick={() => row.pin("top", includeLeafRows, includeParentRows)}
            >
              <KeyboardArrowUp fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() =>
                row.pin("bottom", includeLeafRows, includeParentRows)
              }
            >
              <KeyboardArrowDown fontSize="small" />
            </IconButton>
          </div>
        )}

        {/* Name content */}
        <Typography variant="body2">{getValue()}</Typography>
      </div>
    ),
    id: "full-name",
    size: 300,
  }),
});

const useBigTable = () => {
  const [skin] = useHashState<"mui" | "anocca" | "default">("skin", "mui");
  const columnHelper = createColumnHelper<User>();

  // Get special column definitions based on skin
  const specialColumnDefs = React.useMemo(() => {
    if (skin === "mui" || skin === "anocca") {
      return muiSpecialColumnDefs(columnHelper);
    }
    return defaultSpecialColumnDefs(columnHelper);
  }, [columnHelper, skin]);

  // Build columns structure with injected special columns
  const columns = React.useMemo(() => {
    // Add special columns where they belong
    const allColumns: ColumnDef<User, any>[] = [
      // Use special fullName column
      specialColumnDefs["full-name"],

      // Use special email column
      specialColumnDefs["email"],

      // Normal columns
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

      // Use special isActive column
      specialColumnDefs["is-active"],

      // Country group
      columnHelper.group({
        id: "country-stuff",
        footer: "Country stuff",
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

      // Employment group with special columns injected
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
          // Special salary column
          specialColumnDefs["salary"],
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
          // Special performance score column
          specialColumnDefs["performance-score"],
        ],
      }),
    ];

    // Create additional columns to get to about 100 columns total
    const fieldCycles = [
      "fullName",
      "city",
      "country",
      "favoriteGame",
      "experienceYears",
      "rating",
      "department",
      "jobTitle",
    ];

    const remainingColumns = 100 - allColumns.length;
    for (let i = 0; i < remainingColumns; i += 1) {
      const field = fieldCycles[i % fieldCycles.length];
      allColumns.push(
        columnHelper.accessor(field as any, {
          header: `Extra ${i + 1}`,
          cell: (info) => info.getValue(),
          id: `extra-${i + 1}`,
          size: 150,
        }),
      );
    }

    return allColumns;
  }, [columnHelper, specialColumnDefs]);

  const [data, setData] = React.useState<User[]>(() =>
    // Use a fixed seed for consistent test data
    generateTableData({ maxRows: 1e5, seed: 12345 }),
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
