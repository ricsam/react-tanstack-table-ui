import React from "react";
import { CellAvatar } from "./cell_avatar"; // Import the existing CellAvatar and its props
import { CellAvatarWithTextProps } from "@rttui/core";

// Implement the CellAvatarWithText component for the Anocca skin
export const CellAvatarWithText: React.FC<CellAvatarWithTextProps> = ({
  src,
  alt,
  size = "md", // Default size consistent with CellAvatar
  primary,
  secondary,
  fallback,
}) => {
  // Basic styles for the container div
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px", // Equivalent to Tailwind's gap-x-4 (4 * 4px = 16px)
  };

  // Basic styles for the text div
  const textStyle: React.CSSProperties = {
    fontSize: "0.875rem", // Equivalent to text-sm (14px)
    fontWeight: 500, // Equivalent to font-medium
    color: "#111827", // Equivalent to text-gray-900 (Placeholder, Anocca might have specific colors)
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap", // Equivalent to truncate
  };

  // Generate a meaningful alt text if none provided
  const effectiveAlt = alt;

  return (
    <div style={containerStyle}>
      <CellAvatar
        src={src}
        alt={effectiveAlt}
        size={size}
        fallback={fallback}
      />
      <div style={textStyle}>{primary}</div>
      {secondary && <div style={textStyle}>{secondary}</div>}
    </div>
  );
};
