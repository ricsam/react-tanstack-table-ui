import {
  Box,
  ScopedCssBaseline,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  decorateColumnHelper,
  ReactTanstackTableUi as TableComponent,
} from "@rttui/core";
import {
  AnoccaSkin,
  HeaderPinButtons,
  RowPinButtons as MuiRowPinButtons,
} from "@rttui/skin-anocca";
import {
  CellText,
  Checkbox,
  lightModeVars,
  TailwindSkin,
  RowPinButtons as TwRowPinButtons,
} from "@rttui/skin-tailwind";
import {
  ColumnDef,
  createColumnHelper,
  Table,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";

import "@fontsource/inter";
import "@fontsource/inter/100.css";
import "@fontsource/inter/200.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import "./index.css";

export type Person = {
  id: string;
  name: string;
  age: number;
  city: string;
} & Record<`col${number}`, string>;

const smallData: Person[] = [
  { id: "1", name: "John", age: 20, city: "New York" },
  { id: "2", name: "Jane", age: 21, city: "Los Angeles" },
  { id: "3", name: "Jim", age: 22, city: "Chicago" },
];

const bigData: Person[] = Array.from({ length: 1000 }, (_, i) => ({
  id: i.toString(),
  name: `Person ${i}`,
  age: 20 + i,
  city: `City ${i}`,
  ...Object.fromEntries(
    Array.from({ length: 100 }, (_, j) => [`col${j}`, `${i}-${j}`]),
  ),
}));

export const ReactTanstackTableUi = (
  props: {
    data: "big" | "small" | "none";
    columns: "many" | "few";
    columnDefs?: Record<
      string,
      Partial<ColumnDef<Person, unknown>> | undefined
    >;
    withTwoHeaderRows?: boolean;
    withHeaderGroups?: boolean;
    canSelectRows?: boolean;
  } & Omit<TableOptions<Person>, "data" | "columns"> &
    Omit<React.ComponentProps<typeof TableComponent>, "table">,
) => {
  const theme = useTheme();
  const data: Person[] =
    props.data === "big" ? bigData : props.data === "small" ? smallData : [];

  const columns: ColumnDef<Person, unknown>[] = React.useMemo(() => {
    const originalColumnHelper = createColumnHelper<Person>();
    const columnHelper = props.enableColumnPinning
      ? decorateColumnHelper(originalColumnHelper, {
          header: (original) => (
            <Box sx={{ display: "flex", gap: 2 }}>
              {original}
              {props.enableColumnPinning && <HeaderPinButtons />}
            </Box>
          ),
        })
      : originalColumnHelper;

    const fewColumns: ColumnDef<Person, unknown>[] = [
      columnHelper.accessor("name", {
        id: "name",
        header: "Name",
        cell:
          props.skin === AnoccaSkin
            ? (info) => (
                <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
                  <Typography variant="body2">{info.getValue()}</Typography>
                  {props.enableRowPinning && <Box sx={{ flexGrow: 1 }} />}
                  {props.enableRowPinning && (
                    <MuiRowPinButtons row={info.row} />
                  )}
                </Box>
              )
            : (info) => (
                <div className="flex-1 gap-2 flex items-center">
                  <CellText>{info.getValue()}</CellText>
                  {props.enableRowPinning && <div className="flex-1" />}
                  {props.enableRowPinning && <TwRowPinButtons />}
                </div>
              ),
        ...props.columnDefs?.["name"],
      }),
      columnHelper.accessor("age", {
        id: "age",
        header: "Age",
        cell:
          props.skin === AnoccaSkin
            ? (info) => (
                <Typography variant="body2">{info.getValue()}</Typography>
              )
            : (info) => <CellText>{info.getValue()}</CellText>,
        size: 50,
        ...props.columnDefs?.["age"],
      }),
      columnHelper.accessor("city", {
        id: "city",
        header: "City",
        cell:
          props.skin === AnoccaSkin
            ? (info) => (
                <Typography variant="body2">{info.getValue()}</Typography>
              )
            : (info) => <CellText>{info.getValue()}</CellText>,
        ...props.columnDefs?.["city"],
      }),
    ];

    const manyColumns: ColumnDef<Person, unknown>[] = [
      ...fewColumns,
      ...Array.from({ length: 100 }, (_, i) =>
        columnHelper.accessor(`col${i}`, {
          id: `col${i}`,
          header: `Column ${i}`,
          cell:
            props.skin === AnoccaSkin
              ? (info) => (
                  <Typography variant="body2">{info.getValue()}</Typography>
                )
              : (info) => <CellText>{info.getValue()}</CellText>,
        }),
      ),
    ];

    let cols = props.columns === "few" ? fewColumns : manyColumns;

    if (props.withHeaderGroups) {
      cols.splice(
        0,
        2,
        columnHelper.group({
          id: `personal-info`,
          header: "Personal Info",
          columns: cols.slice(0, 2),
        }),
      );
    }

    if (props.withTwoHeaderRows) {
      cols = cols.map((col) => {
        const newCol: ColumnDef<Person> | undefined = col.id
          ? {
              ...col,
              id: col.id,
              header: () =>
                props.skin === AnoccaSkin ? (
                  <TextField
                    placeholder="Search..."
                    slotProps={{
                      input: { sx: { height: "20px", width: "150px" } },
                    }}
                  />
                ) : (
                  <div className="font-normal">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                    />
                  </div>
                ),
            }
          : undefined;
        const subColumns: ColumnDef<Person>[] = newCol ? [newCol] : [];
        return columnHelper.group({
          id: `group-${col.id}`,
          header: col.header,
          columns: subColumns,
        });
      });
    }
    if (props.canSelectRows) {
      cols.splice(
        0,
        0,
        originalColumnHelper.display({
          id: "selected",
          header: ({ table }) => (
            <Checkbox
              getProps={() => ({
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
              })}
              onChange={() => table.getToggleAllRowsSelectedHandler()}
            />
          ),
          cell: ({ row }) => (
            <div className="flex items-center">
              <Checkbox
                getProps={() => ({
                  checked: row.getIsSelected(),
                  disabled: !row.getCanSelect(),
                  indeterminate: row.getIsSomeSelected(),
                })}
                onChange={() => row.getToggleSelectedHandler()}
              />
            </div>
          ),
        }),
      );
    }
    return cols;
  }, [
    props.skin,
    props.columns,
    props.withHeaderGroups,
    props.withTwoHeaderRows,
    props.canSelectRows,
    props.enableColumnPinning,
    props.enableRowPinning,
    props.columnDefs,
  ]);

  const table = useReactTable({
    ...props,
    data,
    columns,
  });

  let content = <TableComponent {...props} table={table as Table<unknown>} />;
  if (props.skin === AnoccaSkin) {
    content = (
      <ScopedCssBaseline>
        <ThemeProvider theme={theme}>{content}</ThemeProvider>
      </ScopedCssBaseline>
    );
  } else if (props.skin === TailwindSkin) {
    content = (
      <div className="rttui-table light" style={{ ...lightModeVars }}>
        {content}
      </div>
    );
  }
  return content;
};
