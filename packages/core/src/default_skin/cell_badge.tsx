import React from "react";

export type BadgeColor =
  | "gray"
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "indigo"
  | "purple"
  | "pink";

const textColorMap: Record<BadgeColor, string> = {
  gray: "#4b5563",
  red: "#b91c1c",
  yellow: "#854d0e",
  green: "#166534",
  blue: "#1e40af",
  indigo: "#3730a3",
  purple: "#5b21b6",
  pink: "#9d174d",
};

const bgColorMap: Record<BadgeColor, string> = {
  gray: "#f3f4f6",
  red: "#fee2e2",
  yellow: "#fef3c7",
  green: "#dcfce7",
  blue: "#dbeafe",
  indigo: "#e0e7ff",
  purple: "#ede9fe",
  pink: "#fce7f3",
};

export type CellBadgeProps = {
  children?: React.ReactNode;
  color?: BadgeColor;
  bgColor?: BadgeColor;
};

export const CellBadge: React.FC<CellBadgeProps> = ({
  children,
  color = "gray",
  bgColor = "gray",
}) => {
  const textColor = color in textColorMap 
    ? textColorMap[color as BadgeColor] 
    : "var(--table-badge-text, #4b5563)";
  
  const backgroundColor = bgColor in bgColorMap 
    ? bgColorMap[bgColor as BadgeColor] 
    : "var(--table-badge-bg, #f3f4f6)";
  
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.125rem 0.5rem",
        borderRadius: "9999px",
        fontSize: "var(--table-text-size, 0.75rem)",
        fontWeight: "var(--table-bold-weight, 600)",
        color: textColor,
        backgroundColor,
      }}
    >
      {children}
    </span>
  );
};
