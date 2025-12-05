import { Box, BoxProps } from "@mui/material";
import React from "react";

export const CellNumber: React.FC<BoxProps> = ({ children, ...props }) => {
  return (
    <Box
      component="span"
      sx={{
        fontSize: (theme) => theme.typography.body1.fontSize,
        color: "text.secondary",
        fontVariantNumeric: "tabular-nums",
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
