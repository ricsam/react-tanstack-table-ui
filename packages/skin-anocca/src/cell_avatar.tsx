import { CellAvatarProps } from "@rttui/core";
import React from "react";

// Define the size mapping for styling
const sizeMap = {
  sm: 24, // Corresponds to Tailwind's size-6 (6 * 4px = 24px)
  md: 32, // Corresponds to Tailwind's size-8 (8 * 4px = 32px)
  lg: 40, // Corresponds to Tailwind's size-10 (10 * 4px = 40px)
};

// Implement the CellAvatar component for the Anocca skin
export const CellAvatar: React.FC<CellAvatarProps> = ({
  src,
  alt = "",
  size = "md",
}) => {
  const dimension = sizeMap[size];

  // Basic styling for the avatar image
  const style: React.CSSProperties = {
    width: `${dimension}px`,
    height: `${dimension}px`,
    borderRadius: "50%", // Equivalent to rounded-full
    objectFit: "cover", // Ensures the image covers the area nicely
    // Placeholder background - Anocca skin might provide specific colors
    backgroundColor: "#f9fafb", // Equivalent to bg-gray-50
  };

  // It's generally good practice to provide an alt attribute for accessibility
  const effectiveAlt = alt || `Avatar image`;

  return <img src={src} alt={effectiveAlt} style={style} />;
};
