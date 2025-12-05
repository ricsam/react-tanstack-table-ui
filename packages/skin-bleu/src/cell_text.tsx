import { Box, BoxProps } from "@mui/material";
import React from "react";

export const CellText: React.FC<BoxProps> = ({ children, ...props }) => {
  return (
    <Box
      component="span"
      sx={{
        color: "text.secondary",
        fontSize: (theme) => theme.typography.body1.fontSize,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
