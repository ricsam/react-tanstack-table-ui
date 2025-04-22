import CloseIcon from "@mui/icons-material/Close";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { shallowEqual, useRowProps, useRowRef } from "@rttui/core";

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

  const iconButtonSx = {
    width: 24,
    height: 24,
  };

  if (isPinned) {
    return (
      <IconButton
        size="small"
        onClick={() => rowRef()?.row.pin(false, true, true)}
        title="Unpin Row"
        sx={iconButtonSx}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <IconButton
        size="small"
        onClick={() => rowRef()?.row.pin("top", true, true)}
        title="Pin Row to Top"
        sx={iconButtonSx}
      >
        <VerticalAlignTopIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => rowRef()?.row.pin("bottom", true, true)}
        title="Pin Row to Bottom"
        sx={iconButtonSx}
      >
        <VerticalAlignBottomIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
