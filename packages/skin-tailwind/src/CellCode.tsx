import React from "react";


export const CellCode: React.FC<{ children: React.ReactNode; }> = ({
  children,
}) => {
  return (
    <div className="font-mono text-sm text-gray-800 dark:text-gray-400">
      {children}
    </div>
  );
};
