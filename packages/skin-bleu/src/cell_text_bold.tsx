import { Box, BoxProps } from "@mui/material";
import React from "react";

export const CellTextBold: React.FC<BoxProps> = ({ children, ...props }) => {
  return (
    <Box
      component="span"
      sx={{
        color: "text.secondary",
        fontWeight: "medium",
        fontSize: (theme) => theme.typography.body1.fontSize,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
