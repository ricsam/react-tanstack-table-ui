import { Box, Typography } from "@mui/material";

export const SpreadsheetRowHeader = ({ index }: { index: number }) => {
  return (
    <Box
      className="spreadsheet-row-header"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
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
        {index + 1}
      </Typography>
    </Box>
  );
};
