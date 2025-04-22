import React from "react";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/material/styles";

// TODO: Implement MUI skin component
export const CellTextBold: React.FC<{
  children: React.ReactNode;
  sx?: SxProps<Theme>; // Allow sx prop for customization
}> = ({
  children,
  sx,
}) => {
  return (
    <Typography
      variant="body2" // Equivalent to text-sm
      component="span" // Render as a span
      sx={{
        fontWeight: "medium",
        color: "text.primary", // Use primary text color for bolder text
        ...sx, // Apply custom sx props
      }}
    >
      {children}
    </Typography>
  );
}; 