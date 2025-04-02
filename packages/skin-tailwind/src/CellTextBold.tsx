import React from "react";


export const CellTextBold: React.FC<{ children: React.ReactNode; }> = ({
  children,
}) => {
  return (
    <span className="text-sm font-medium text-gray-900 dark:text-white">
      {children}
    </span>
  );
};
