import React from "react";

type CellTextBoldProps = {
  children: React.ReactNode;
  className?: string;
};

export const CellTextBold: React.FC<CellTextBoldProps> = ({
  children,
  className,
}) => {
  const style: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: 500,
  };

  return (
    <span style={style} className={className}>
      {children}
    </span>
  );
};
