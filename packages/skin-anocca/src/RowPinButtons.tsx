import { Row } from "@tanstack/react-table";
import { IconButton, Stack } from "@mui/material";
import { FiX, FiChevronUp, FiChevronDown } from "react-icons/fi";

export function RowPinButtons({ row }: { row: Row<any> }) {
  if (!row.getCanPin()) {
    return null;
  }

  if (row.getIsPinned()) {
    return (
      <IconButton
        onClick={() => row.pin(false, true, true)}
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
        onClick={() => row.pin("top", true, true)}
        size="small"
        sx={{ color: "text.secondary" }}
      >
        <FiChevronUp size={16} />
      </IconButton>
      <IconButton
        onClick={() => row.pin("bottom", true, true)}
        size="small"
        sx={{ color: "text.secondary" }}
      >
        <FiChevronDown size={16} />
      </IconButton>
    </Stack>
  );
}
