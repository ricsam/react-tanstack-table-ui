import React from "react";

type CellTagProps = {
  children: React.ReactNode;
};

export const CellTag: React.FC<CellTagProps> = ({ children }) => {
  const style: React.CSSProperties = {
    display: "inline-block",
    padding: "0.25rem 0.5rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "#4b5563",
    backgroundColor: "#f3f4f6",
    borderRadius: "0.375rem",
    border: "1px solid rgba(209, 213, 219, 0.2)",
  };

  return <div style={style}>{children}</div>;
};
