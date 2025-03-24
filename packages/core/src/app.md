```tsx
import "./app.css";

import { VirtualizedTable } from "./table/table";
import { useBigTable } from "./table/tests_data/use_big_table";

export default function App() {
  const { data, setData, columnOrder, setColumnOrder, table, getSubRows } =
    useBigTable();
  // const { data, setData, columnOrder, setColumnOrder, table, getSubRows } =
  //   useSmallTableWithHeaders();
  // const { data, setData, columnOrder, setColumnOrder, table, getSubRows } =
  //   useSmallTable();
  // const { data, setData, columnOrder, setColumnOrder, table, getSubRows } =
  //   useSmallTableExpandable();
  // const { data, setData, columnOrder, setColumnOrder, table, getSubRows } =
  //   useSmallTableExpandableAndSelectable();

  return (
    <div style={{ textAlign: "center" }}>
      <VirtualizedTable
        width={1920}
        height={1600}
        data={data}
        updateData={setData}
        columnOrder={columnOrder}
        updateColumnOrder={setColumnOrder}
        table={table}
        getSubRows={getSubRows}
        updateSubRows={(row, newSubRows) => {
          return { ...row, otherCountries: newSubRows };
        }}
        getId={(row) => String(row.id)}
        getGroup={(row) => "root"}
        rootGroup="root"
        rowHeight={32}
      />
    </div>
  );
}
```