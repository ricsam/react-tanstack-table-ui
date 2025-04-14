export const createSourceCode = (opts?: { hookOptions?: string, props?: string, nameMeta?: string }) => {
  return `import { createColumnHelper, useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Box } from "@mui/material";
import { HeaderPinButtons } from "@rttui/skin-anocca";
import { ReactTanstackTableUi, decorateColumnHelper } from "@rttui/core";

type Person = {
  id: string;
  name: string;
  age: number;
  city: string;
};

const data: Person[] = [
  { id: "1", name: "John", age: 20, city: "New York" },
  { id: "2", name: "Jane", age: 21, city: "Los Angeles" },
  { id: "3", name: "Jim", age: 22, city: "Chicago" },
];

const columnHelper = decorateColumnHelper(createColumnHelper<Person>(), {
  header: (original) => (
    <Box sx={{ display: "flex", gap: 2 }}>
      {original}
      {props.enableColumnPinning && <HeaderPinButtons />}
    </Box>
  ),
});

const columns = [
  columnHelper.accessor("name", {
    header: "Name",${opts?.nameMeta ? '\n' + opts.nameMeta : ''}
  }),
  columnHelper.accessor("age", {
    header: "Age",
    size: 50,
  }),
  columnHelper.accessor("city", {
    header: "City",
  }),
];

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel()${opts?.hookOptions ? '\n' + opts.hookOptions : ''}
});

<ReactTanstackTableUi
  table={table}
  enableColumnPinning${opts?.props ? '\n' + opts.props : ''}
/>
`;
};
