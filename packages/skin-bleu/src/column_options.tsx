import { Divider, IconButton, Menu, MenuItem } from "@mui/material";
import {
  shallowEqual,
  useColProps,
  useColRef,
  useCrushAllCols,
  useCrushHeader,
} from "@rttui/core";
import { MouseEvent, useState } from "react";
import { FiMoreHorizontal as MoreHorizontal } from "react-icons/fi";
import {
  LuArrowDown as ArrowDown,
  LuArrowUp as ArrowUp,
  LuCheck as Check,
} from "react-icons/lu";

export function ColumnOptions() {
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
