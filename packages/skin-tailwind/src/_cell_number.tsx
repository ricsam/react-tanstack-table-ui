import React from "react";


export const CellNumber: React.FC<{ children: React.ReactNode; }> = ({
  children,
}) => {
  return (
    <span className="text-sm text-gray-500 dark:text-gray-300 tabular-nums">
      {children}
    </span>
  );
};
