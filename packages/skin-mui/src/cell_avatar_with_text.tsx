import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CellAvatar } from "./cell_avatar"; // Reuse the MUI CellAvatar
import { CellAvatarWithTextProps } from "@rttui/core";

export const CellAvatarWithText: React.FC<CellAvatarWithTextProps> = ({
  src,
  alt = "",
  size = "md",
  primary,
  secondary,
  fallback,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <CellAvatar src={src} alt={alt} size={size} fallback={fallback} />
      <Typography
        variant="body2"
        noWrap // Equivalent to truncate
        sx={{
          fontWeight: "medium",
          color: "text.primary", // Adapts to light/dark mode
        }}
      >
        {primary}
      </Typography>
      {secondary && (
        <Typography variant="body2" noWrap>
          {secondary}
        </Typography>
      )}
    </Box>
  );
};
