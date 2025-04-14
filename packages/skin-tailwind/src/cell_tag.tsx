import React from "react";


export const CellTag: React.FC<{ children: React.ReactNode; }> = ({
  children,
}) => {
  return (
    <div className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-300/20 dark:bg-gray-700/40 dark:text-gray-400 dark:ring-white/10">
      {children}
    </div>
  );
};
