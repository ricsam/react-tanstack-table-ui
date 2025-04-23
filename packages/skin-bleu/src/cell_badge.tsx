import React from "react";
import { CellBadgeProps, BadgeColor } from "@rttui/core";
// Map badge colors to basic CSS style objects (placeholders)
const colorStyles: Record<BadgeColor, React.CSSProperties> = {
  gray: { backgroundColor: "#f3f4f6", color: "#1f2937" }, // bg-gray-100, text-gray-800
  red: { backgroundColor: "#fee2e2", color: "#991b1b" }, // bg-red-100, text-red-800
  yellow: { backgroundColor: "#fef9c3", color: "#854d0e" }, // bg-yellow-100, text-yellow-800
  green: { backgroundColor: "#dcfce7", color: "#166534" }, // bg-green-100, text-green-800
  blue: { backgroundColor: "#dbeafe", color: "#1e40af" }, // bg-blue-100, text-blue-800
  indigo: { backgroundColor: "#e0e7ff", color: "#3730a3" }, // bg-indigo-100, text-indigo-800
  purple: { backgroundColor: "#f3e8ff", color: "#581c87" }, // bg-purple-100, text-purple-800
  pink: { backgroundColor: "#fce7f3", color: "#831843" }, // bg-pink-100, text-pink-800
};

// Implement the CellBadge component for the Bleu skin
export const CellBadge: React.FC<CellBadgeProps> = ({
  children,
  color = "gray", // Default to gray if no color is provided
}) => {
  // Base styles for the badge
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "9999px", // Equivalent to rounded-full
    padding: "0.125rem 0.625rem", // Equivalent to py-0.5 px-2.5
    fontSize: "0.75rem", // Equivalent to text-xs
    fontWeight: 500, // Equivalent to font-medium
    whiteSpace: "nowrap", // Prevent wrapping
  };

  // Merge base styles with color-specific styles
  const finalStyle = { ...baseStyle, ...colorStyles[color] };

  return <span style={finalStyle}>{children}</span>;
};
