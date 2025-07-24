import { Box, Typography } from "@mui/material";
import { useSelectionManagerCls } from "./selection_manager_context";
import { useCallback } from "react";

const indexToColumn = (index: number): string => {
  let result = "";
  let num = index + 1; // Convert to 1-based

  while (num > 0) {
    const remainder = (num - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    num = Math.floor((num - 1) / 26);
  }

  return result;
};

export const SpreadsheetColHeader = ({ index }: { index: number }) => {
  const selectionManager = useSelectionManagerCls();
  const headerRef = useCallback(
    (el: HTMLElement | null) => {
      if (el) {
        return selectionManager.setupHeaderElement(el, index, "col");
      }
    },
    [index, selectionManager],
  );
  if (index === 0) {
    return null;
  }
  return (
    <Box
      className="spreadsheet-col-header"
      ref={headerRef}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        cursor: "pointer",
      }}
    >
      <Typography
        variant="body2"
        color="text.primary"
        fontWeight="bold"
        textAlign="center"
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        {indexToColumn(index - 1)}
      </Typography>
    </Box>
  );
};
