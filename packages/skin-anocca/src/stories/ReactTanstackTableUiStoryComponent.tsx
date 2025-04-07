import { Box, ScopedCssBaseline, ThemeProvider } from "@mui/material";
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
          <HeaderPinButtons />
        </Box>
      ),
    });

    const fewColumns = [
      columnHelper.accessor("name", {
        header: "Name",
        meta: props.meta?.["name"],
      }),
      columnHelper.accessor("age", {
        header: "Age",
        meta: props.meta?.["age"],
      }),
      columnHelper.accessor("city", {
        header: "City",
        meta: props.meta?.["city"],
      }),
    ];

    const manyColumns = [
      ...fewColumns,
      ...Array.from({ length: 100 }, (_, i) =>
        columnHelper.accessor(`col${i}`, {
          header: `Column ${i}`,
          cell: (info) => info.getValue(),
        }),
      ),
    ];

    return props.columns === "few" ? fewColumns : manyColumns;
  }, [props.columns, props.meta]);

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
