import { IconButton, Stack } from "@mui/material";
import { shallowEqual, useRowProps, useRowRef } from "@rttui/core";
import {
  MdClose,
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";

export function RowPinButtons() {
  const { canPin, isPinned } = useRowProps({
    callback: (vrow) => {
      const row = vrow.row;
      return {
        canPin: row.getCanPin(),
        isPinned: row.getIsPinned(),
      };
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [{ type: "tanstack_table" }],
  });
  const rowRef = useRowRef();

  if (!canPin) {
    return null;
  }

  if (isPinned) {
    return (
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          rowRef()?.row.pin(false, true, true);
        }}
        size="small"
        sx={{ color: "text.secondary" }}
      >
        <MdClose size={16} />
      </IconButton>
    );
  }

  return (
    <Stack direction="row">
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          rowRef()?.row.pin("top", true, true);
        }}
        size="small"
        sx={{ color: "text.secondary" }}
      >
        <MdOutlineKeyboardArrowUp size={16} />
      </IconButton>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          rowRef()?.row.pin("bottom", true, true);
        }}
        size="small"
        sx={{ color: "text.secondary" }}
      >
        <MdOutlineKeyboardArrowDown size={16} />
      </IconButton>
    </Stack>
  );
}
