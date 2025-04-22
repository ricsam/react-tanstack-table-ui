import React from "react";
import Typography from "@mui/material/Typography";

// TODO: Implement MUI skin component
export const CellText: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Typography
      variant="body2" // Equivalent to text-sm
      component="span" // Render as a span
      sx={{
        color: "text.secondary", // Equivalent to text-gray-500/dark:text-gray-300
      }}
    >
      {children}
    </Typography>
  );
}; 