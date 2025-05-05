import { Resizer } from "./resizer";
import {
  shallowEqual,
  useColProps,
  useColRef,
  useCrushAllCols,
  useCrushHeader,
  useTableContext,
} from "@rttui/core";
import { Checkbox } from "./checkbox";
import { HeaderPinButtons } from "./header_pin_buttons";
import { Menu, MenuItem, Divider, Button, IconButton } from "@mui/material";
import {
  LuArrowDown as ArrowDown,
  LuArrowUp as ArrowUp,
  LuArrowUpDown as ArrowUpDown,
  LuCheck as Check,
} from "react-icons/lu";
import { FiMoreHorizontal as MoreHorizontal } from "react-icons/fi";
import { useState, MouseEvent } from "react";
import { HeaderResizer } from "./header_resizer";

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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{ padding: 0, width: "32px", height: "32px" }}
      >
        <MoreHorizontal />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {canSort && [
          <MenuItem
            key="sort-asc"
            onClick={() => {
              if (isSorted === "asc") {
                colRef().column.clearSorting();
              } else {
                colRef().column.toggleSorting(false);
              }
              handleClose();
            }}
            sx={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <ArrowUp />
            Sort ascending
            {isSorted === "asc" && <Check />}
          </MenuItem>,
          <MenuItem
            key="sort-desc"
            onClick={() => {
              if (isSorted === "desc") {
                colRef().column.clearSorting();
              } else {
                colRef().column.toggleSorting(true);
              }
              handleClose();
            }}
            sx={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <ArrowDown />
            Sort descending
            {isSorted === "desc" && <Check />}
          </MenuItem>,
          <Divider key="divider-1" />,
        ]}

        {canPin && [
          <MenuItem
            key="pin-left"
            onClick={() => {
              if (isPinned === "left") {
                colRef().column.pin(false);
              } else {
                colRef().column.pin("left");
              }
              handleClose();
            }}
          >
            Pin left
            {isPinned === "left" && <Check />}
          </MenuItem>,
          <MenuItem
            key="pin-right"
            onClick={() => {
              if (isPinned === "right") {
                colRef().column.pin(false);
              } else {
                colRef().column.pin("right");
              }
              handleClose();
            }}
          >
            Pin right
            {isPinned === "right" && <Check />}
          </MenuItem>,
          <Divider key="divider-2" />,
        ]}
        <MenuItem
          onClick={() => {
            crushHeader(colRef().header);
            handleClose();
          }}
        >
          Autosize this column
        </MenuItem>
        <MenuItem
          onClick={() => {
            crushAllColumns();
            handleClose();
          }}
        >
          Autosize all columns
        </MenuItem>
      </Menu>
    </>
  );
}
