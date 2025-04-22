import React from "react";

// TODO: Implement default skin component
export const CellText: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <span
      style={{
        fontSize: "var(--table-text-size, 0.875rem)",
        color: "var(--table-text-color, inherit)",
      }}
    >
      {children}
    </span>
  );
}; 