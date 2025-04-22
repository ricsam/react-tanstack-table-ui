import React from "react";
import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";

// export const CellTag: React.FC<{ children: React.ReactNode }> = ({ // Removed TODO
export const CellTag: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Chip
      label={children}
      size="small" // Closest to the padding/text size in Tailwind
      variant="filled" // Use filled variant for background color
      sx={(theme) => ({
        height: "auto", // Allow height to adjust to content + padding
        borderRadius: theme.shape.borderRadius, // Equivalent to rounded-md
        backgroundColor: alpha(theme.palette.grey[500], 0.1), // Similar to bg-gray-100 / dark:bg-gray-700/40
        color: theme.palette.text.secondary, // Equivalent to text-gray-600 / dark:text-gray-400
        fontWeight: "medium",
        fontSize: theme.typography.pxToRem(12), // Equivalent to text-xs
        "& .MuiChip-label": {
          padding: theme.spacing(0.25, 1), // Match px-2 py-1 roughly
        },
        // Add a subtle ring like the Tailwind version
        border: `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
        // Dark mode adjustments (assuming theme handles dark mode)
        ...(theme.palette.mode === 'dark' && {
          backgroundColor: alpha(theme.palette.common.white, 0.1),
          border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        })
      })}
    />
  );
}; 