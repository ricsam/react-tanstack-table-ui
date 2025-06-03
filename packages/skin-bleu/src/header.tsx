import { Button } from "@mui/material";
import {
  shallowEqual,
  useColProps,
  useColRef,
  useTableContext,
} from "@rttui/core";
import {
  LuArrowDown as ArrowDown,
  LuArrowUp as ArrowUp,
  LuArrowUpDown as ArrowUpDown,
} from "react-icons/lu";
import { Checkbox } from "./checkbox";
import { ColumnOptions } from "./column_options";
import { HeaderPinButtons } from "./header_pin_buttons";
import { HeaderResizer } from "./header_resizer";
import { Resizer } from "./resizer";

export function Header({
  children,
  checkbox,
  pinButtons,
  resizer,
  sorting,
  options,
  accessibleResizer,
}: {
  children?: React.ReactNode;
  checkbox?: boolean;
  pinButtons?: boolean;
  resizer?: boolean;
  sorting?: boolean;
  options?: boolean;
  accessibleResizer?: boolean;
}) {
  const tableRef = useTableContext().tableRef;
  const colRef = useColRef();
  const { isSorted, canSort } = useColProps({
    callback: ({ column }) => {
      return {
        isSorted: column.getIsSorted(),
        canSort: column.getCanSort(),
      };
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [{ type: "tanstack_table" }],
  });
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

      {sorting && canSort ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button
            variant="text"
            size="small"
            sx={{
              cursor: "pointer",
              color: "text.primary",
              textTransform: "none",
              fontWeight: "bold",
            }}
            onClick={(ev: React.MouseEvent) => {
              const column = colRef().column;
              const isMulti = ev.shiftKey && column.getCanMultiSort();
              return column.toggleSorting(undefined, isMulti);
            }}
            endIcon={
              !isSorted ? (
                <ArrowUpDown style={{ color: "rgba(0,0,0,0.6)" }} />
              ) : isSorted === "asc" ? (
                <ArrowUp />
              ) : (
                <ArrowDown />
              )
            }
          >
            {children}
          </Button>
        </div>
      ) : (
        children
      )}

      <div style={{ flex: "1", flexShrink: 0 }} />
      {pinButtons && <HeaderPinButtons />}
      {accessibleResizer && <HeaderResizer />}
      {options && <ColumnOptions />}
      {resizer && <Resizer />}
    </div>
  );
}
