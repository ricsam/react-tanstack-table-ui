import React from "react";

type CellTextProps = {
  children: React.ReactNode;
};

export const CellText: React.FC<CellTextProps> = ({ children }) => {
  const style: React.CSSProperties = {
    fontSize: "0.875rem",
    color: "#6b7280",
  };

  return <span style={style}>{children}</span>;
};
