import React from "react";

// TODO: Implement default skin component
export const CellTag: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <span
      style={{
        fontSize: "var(--table-text-size, 0.75rem)",
        color: "var(--table-text-color, inherit)",
        backgroundColor: "var(--table-tag-bg, #f3f4f6)",
        borderRadius: "9999px",
        padding: "0.125rem 0.5rem",
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}; 