import React from "react";


export const CellTextBold: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <span className={`text-sm font-medium ${className}`}>
      {children}
    </span>
  );
};
