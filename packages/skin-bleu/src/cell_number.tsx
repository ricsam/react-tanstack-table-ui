import React from "react";

type CellNumberProps = {
  children: React.ReactNode;
};

export const CellNumber: React.FC<CellNumberProps> = ({ children }) => {
  const style: React.CSSProperties = {
    fontSize: "0.875rem",
    color: "#6b7280",
    fontVariantNumeric: "tabular-nums",
  };

  return <span style={style}>{children}</span>;
};
