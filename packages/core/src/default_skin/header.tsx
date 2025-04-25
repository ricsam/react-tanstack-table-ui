import { useTableContext } from "../table/table_context";
import { Checkbox } from "./checkbox";
import { HeaderPinButtons } from "./header_pin_buttons";
import { Resizer } from "./resizer";
export function Header({
  children,
  checkbox,
  pinButtons,
  resizer,
}: {
  children?: React.ReactNode;
  checkbox?: boolean;
  pinButtons?: boolean;
  resizer?: boolean;
}) {
  const tableRef = useTableContext().tableRef;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flex: "1",
        flexShrink: 0,
      }}
    >
      {checkbox && (
        <Checkbox
          getProps={() => {
            const table = tableRef.current.tanstackTable;
            return {
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
            };
          }}
          onChange={() => {
            const table = tableRef.current.tanstackTable;
            return table.getToggleAllRowsSelectedHandler();
          }}
        />
      )}

      {children}

      <div style={{ flex: "1", flexShrink: 0 }} />
      {pinButtons && <HeaderPinButtons />}
      {resizer && <Resizer />}
    </div>
  );
}
