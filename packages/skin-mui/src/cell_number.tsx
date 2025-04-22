import React from "react";
import Typography from "@mui/material/Typography";

// export const CellNumber: React.FC<{ children: React.ReactNode }> = ({ // Removed TODO
export const CellNumber: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Typography
      variant="body2" // Equivalent to text-sm
      component="span" // Render as a span
      sx={{
        color: "text.secondary", // Equivalent to text-gray-500/dark:text-gray-300
        fontVariantNumeric: "tabular-nums", // Apply tabular numbers
      }}
    >
      {children}
    </Typography>
  );
}; 