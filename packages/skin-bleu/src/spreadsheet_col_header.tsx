import { Box, Typography } from "@mui/material";
import { useCallback } from "react";
import { useSelectionManagerCls } from "./selection_manager_context";
import { useSpreadsheetColIndex } from "./use_spreadsheet_col_index";
import { Resizer } from "./resizer";

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

export const SpreadsheetColHeader = ({
  tableColIndex,
  resizer,
}: {
  tableColIndex: number;
  resizer?: boolean;
}) => {
  const spreadsheetColIndex = useSpreadsheetColIndex(tableColIndex);

  const selectionManager = useSelectionManagerCls();
  const headerRef = useCallback(
    (el: HTMLElement | null) => {
      if (el && spreadsheetColIndex !== null) {
        return selectionManager.setupHeaderElement(
          el,
          spreadsheetColIndex,
          "col",
        );
      }
    },
    [spreadsheetColIndex, selectionManager],
  );

  if (spreadsheetColIndex === null) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        flex: 1,
        height: "100%",
        width: "100%",
      }}
    >
      <Box
        className="spreadsheet-col-header"
        ref={headerRef}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          cursor: "pointer",
          height: "100%",
          width: "100%",
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
          {indexToColumn(spreadsheetColIndex)}
        </Typography>
      </Box>
      {resizer && <Resizer />}
    </Box>
  );
};
