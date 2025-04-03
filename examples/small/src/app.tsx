import { ReactTanstackTableUi, lightModeVars } from "@rttui/core";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

const data = [
  {
    id: "1",
    name: "John",
  },
  {
    id: "2",
    name: "Jane",
  },
];
const columnHelper = createColumnHelper<(typeof data)[number]>();
function Cell({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => <Cell>{info.getValue()}</Cell>,
  }),
];
export function App() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId(originalRow) {
      return originalRow.id;
    },
    defaultColumn: {
      minSize: 60,
      maxSize: 800,
    },
    keepPinnedRows: true,
  });

  return (
    <div
      style={{
        width: "600px",
        height: "400px",
        ...lightModeVars,
      }}
    >
      <ReactTanstackTableUi
        width={600}
        height={400}
        table={table}
        renderSubComponent={({ row }) => {
          return (
            <pre style={{ fontSize: "10px", textAlign: "left" }}>
              <code>{JSON.stringify(row.original, null, 2)}</code>
            </pre>
          );
        }}
      />
    </div>
  );
}
