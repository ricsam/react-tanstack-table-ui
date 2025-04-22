import React from "react";
import Chip, { ChipProps } from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import * as colors from "@mui/material/colors";
import { CellBadgeProps, BadgeColor } from "@rttui/core";

// TODO: Implement MUI skin component
export const CellBadge: React.FC<CellBadgeProps> = ({
  children,
  color = "gray",
}) => {
  const theme = useTheme();

  const getChipProps = (badgeColor: BadgeColor): ChipProps => {
    // Map Tailwind colors to MUI Chip color prop or custom sx
    // Aiming for similar visual appearance (light background, darker text)
    const commonSx = {
      height: "auto",
      borderRadius: "9999px", // rounded-full
      fontSize: theme.typography.pxToRem(12), // text-xs
      fontWeight: "medium",
      "& .MuiChip-label": {
        padding: theme.spacing(0.125, 1.25), // Match px-2.5 py-0.5 roughly
      },
    };

    switch (badgeColor) {
      case "green":
        return { color: "success", sx: commonSx };
      case "blue":
        return { color: "info", sx: commonSx };
      case "yellow":
        return { color: "warning", sx: commonSx };
      case "red":
        return { color: "error", sx: commonSx };
      case "indigo":
        return {
          sx: {
            ...commonSx,
            backgroundColor: alpha(
              colors.indigo[100],
              theme.palette.mode === "dark" ? 0.2 : 1,
            ),
            color:
              theme.palette.mode === "dark"
                ? colors.indigo[300]
                : colors.indigo[800],
          },
        };
      case "purple":
        return {
          sx: {
            ...commonSx,
            backgroundColor: alpha(
              colors.purple[100],
              theme.palette.mode === "dark" ? 0.2 : 1,
            ),
            color:
              theme.palette.mode === "dark"
                ? colors.purple[300]
                : colors.purple[800],
          },
        };
      case "pink":
        return {
          sx: {
            ...commonSx,
            backgroundColor: alpha(
              colors.pink[100],
              theme.palette.mode === "dark" ? 0.2 : 1,
            ),
            color:
              theme.palette.mode === "dark"
                ? colors.pink[300]
                : colors.pink[800],
          },
        };
      case "gray":
      default:
        return { color: "default", sx: commonSx }; // MUI default often maps to gray
    }
  };

  return <Chip label={children} size="small" {...getChipProps(color)} />;
};
