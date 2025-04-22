import React from "react";

export const CellTextBold: React.FC<{ 
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  className,
  style,
}) => {
  return (
    <span
      className={className}
      style={{
        fontSize: "var(--table-text-size, 0.875rem)",
        color: "var(--table-text-color, inherit)",
        fontWeight: "var(--table-bold-weight, 600)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}; 