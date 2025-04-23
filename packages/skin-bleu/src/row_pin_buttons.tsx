import { IconButton, Stack } from "@mui/material";
import { shallowEqual, useRowProps, useRowRef } from "@rttui/core";
import { FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";

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
        onClick={() => rowRef()?.row.pin(false, true, true)}
        size="small"
        sx={{ color: "text.secondary" }}
      >
        <FiX size={16} />
      </IconButton>
    );
  }

  return (
    <Stack direction="row">
      <IconButton
        onClick={() => rowRef()?.row.pin("top", true, true)}
        size="small"
        sx={{ color: "text.secondary" }}
      >
        <FiChevronUp size={16} />
      </IconButton>
      <IconButton
        onClick={() => rowRef()?.row.pin("bottom", true, true)}
        size="small"
        sx={{ color: "text.secondary" }}
      >
        <FiChevronDown size={16} />
      </IconButton>
    </Stack>
  );
}
