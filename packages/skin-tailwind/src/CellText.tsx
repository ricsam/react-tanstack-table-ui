import React from "react";

// Cell content components

export const CellText: React.FC<{ children: React.ReactNode; }> = ({
  children,
}) => {
  return (
    <span className="text-sm text-gray-500 dark:text-gray-300">{children}</span>
  );
};
