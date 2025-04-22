import React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { CellAvatarProps } from "@rttui/core";

// export const CellAvatar: React.FC<{ // Removed TODO comment
export const CellAvatar: React.FC<CellAvatarProps> = ({
  src,
  alt = "",
  size = "md",
}) => {
  const sizeMap = {
    sm: 24, // Equivalent to size-6 in Tailwind (1.5rem)
    md: 32, // Equivalent to size-8 in Tailwind (2rem)
    lg: 40, // Equivalent to size-10 in Tailwind (2.5rem)
  };

  const avatarSize = sizeMap[size];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Avatar
        src={src}
        alt={alt}
        sx={{
          width: avatarSize,
          height: avatarSize,
          // Added a slight background color for consistency with Tailwind example
          bgcolor: "grey.200", // Light grey for light mode
          "&.dark": {
            // Assuming a parent '.dark' class for dark mode
            bgcolor: "grey.800", // Darker grey for dark mode
          },
        }}
      />
    </Box>
  );
};
