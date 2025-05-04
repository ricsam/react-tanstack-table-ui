import { Resizer } from "@/registry/new-york/rttui/resizer";
import {
  shallowEqual,
  useColProps,
  useColRef,
  useCrushAllCols,
  useCrushHeader,
  useTableContext,
} from "@rttui/core";
import { Checkbox } from "@/registry/new-york/rttui/checkbox";
import { HeaderPinButtons } from "@/registry/new-york/rttui/header-pin-buttons";
import { Button } from "@/registry/new-york/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  MoreHorizontal,
} from "lucide-react";

export function Header({
  children,
  checkbox,
  pinButtons,
  resizer,
  sorting,
  options,
}: {
  children?: React.ReactNode;
  checkbox?: boolean;
  pinButtons?: boolean;
  resizer?: boolean;
  sorting?: boolean;
  options?: boolean;
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
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="cursor-pointer"
            onClick={(ev) => {
              const column = colRef().column;
              const isMulti = ev.shiftKey && column.getCanMultiSort();
              return column.toggleSorting(undefined, isMulti);
            }}
          >
            {children}
            {!isSorted ? (
              <ArrowUpDown className="text-muted-foreground" />
            ) : isSorted === "asc" ? (
              <ArrowUp />
            ) : (
              <ArrowDown />
            )}
          </Button>
        </div>
      ) : (
        children
      )}

      <div style={{ flex: "1", flexShrink: 0 }} />
      {pinButtons && <HeaderPinButtons />}
      {options && <Options />}
      {resizer && <Resizer />}
    </div>
  );
}

function Options() {
  const crushHeader = useCrushHeader();
  const crushAllColumns = useCrushAllCols();
  const colRef = useColRef();
  const { isSorted, canSort, isPinned, canPin } = useColProps({
    callback: ({ column }) => {
      return {
        isSorted: column.getIsSorted(),
        canSort: column.getCanSort(),
        isPinned: column.getIsPinned(),
        canPin: column.getCanPin(),
      };
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [{ type: "tanstack_table" }],
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canSort && (
          <>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                if (isSorted === "asc") {
                  colRef().column.clearSorting();
                } else {
                  colRef().column.toggleSorting(false);
                }
              }}
            >
              <ArrowUp />
              Sort ascending
              {isSorted === "asc" && <Check />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                if (isSorted === "desc") {
                  colRef().column.clearSorting();
                } else {
                  colRef().column.toggleSorting(true);
                }
              }}
            >
              <ArrowDown />
              Sort descending
              {isSorted === "desc" && <Check />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {canPin && (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                if (isPinned === "left") {
                  colRef().column.pin(false);
                } else {
                  colRef().column.pin("left");
                }
              }}
            >
              Pin left
              {isPinned === "left" && <Check />}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                if (isPinned === "right") {
                  colRef().column.pin(false);
                } else {
                  colRef().column.pin("right");
                }
              }}
            >
              Pin right
              {isPinned === "right" && <Check />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            crushHeader(colRef().header);
          }}
        >
          Autosize this column
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            crushAllColumns();
          }}
        >
          Autosize all columns
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
