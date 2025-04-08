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
  ColumnDef,
  ColumnMeta,
  createColumnHelper,
  Table,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";
import { HeaderPinButtons } from "../HeaderPinButtons";
import React from "react";
import { RowPinButtons } from "../RowPinButtons";
type Person = {
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
    Array.from({ length: 100 }, (_, j) => [`col${j}`, `Value ${i}-${j}`]),
  ),
}));

export const ReactTanstackTableUi = (
  props: {
    data: "big" | "small";
    columns: "many" | "few";
    meta?: Record<string, ColumnMeta<Person, string>>;
    withTwoHeaderRows?: boolean;
    withHeaderGroups?: boolean;
  } & Omit<TableOptions<Person>, "data" | "columns"> &
    Omit<React.ComponentProps<typeof TableComponent>, "table">,
) => {
  const theme = useTheme();
  const data: Person[] = props.data === "big" ? bigData : smallData;

  const columns: ColumnDef<Person>[] = React.useMemo(() => {
    const columnHelper = decorateColumnHelper(createColumnHelper<Person>(), {
      header: (original) => (
        <Box sx={{ display: "flex", gap: 2 }}>
          {original}
          {props.enableColumnPinning && <HeaderPinButtons />}
        </Box>
      ),
    });

    const fewColumns: ColumnDef<Person>[] = [
      columnHelper.accessor("name", {
        id: "name",
        header: "Name",
        cell: (info) => (
          <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
            <Typography variant="body2">{info.getValue()}</Typography>
            {props.enableRowPinning && <Box sx={{ flexGrow: 1 }} />}
            {props.enableRowPinning && <RowPinButtons row={info.row} />}
          </Box>
        ),
        meta: props.meta?.["name"],
      }),
      columnHelper.accessor("age", {
        id: "age",
        header: "Age",
        meta: props.meta?.["age"],
        cell: (info) => (
          <Typography variant="body2">{info.getValue()}</Typography>
        ),
        size: 50,
      }),
      columnHelper.accessor("city", {
        id: "city",
        header: "City",
        meta: props.meta?.["city"],
        cell: (info) => (
          <Typography variant="body2">{info.getValue()}</Typography>
        ),
      }),
    ];

    const manyColumns: ColumnDef<Person>[] = [
      ...fewColumns,
      ...Array.from({ length: 100 }, (_, i) =>
        columnHelper.accessor(`col${i}`, {
          id: `col${i}`,
          header: `Column ${i}`,
          cell: (info) => (
            <Typography variant="body2">{info.getValue()}</Typography>
          ),
        }),
      ),
    ];

    const cols = props.columns === "few" ? fewColumns : manyColumns;

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
      return cols.map((col) => {
        const newCol: ColumnDef<Person> | undefined = col.id
          ? {
              ...col,
              id: col.id,
              header: () => (
                <TextField
                  placeholder="Search..."
                  slotProps={{
                    input: { sx: { height: "20px", width: "150px" } },
                  }}
                />
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
    return cols;
  }, [
    props.columns,
    props.enableColumnPinning,
    props.enableRowPinning,
    props.meta,
    props.withTwoHeaderRows,
    props.withHeaderGroups,
  ]);

  const table = useReactTable({
    ...props,
    data,
    columns,
  });

  return (
    <ScopedCssBaseline>
      <ThemeProvider theme={theme}>
        <TableComponent {...props} table={table as Table<unknown>} />
      </ThemeProvider>
    </ScopedCssBaseline>
  );
};
