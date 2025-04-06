import React from "react";

export const CellCode: React.FC<{
  children?: React.ReactNode;
  code?: string;
}> = ({ children, code }) => {
  const props = code ? { dangerouslySetInnerHTML: { __html: code } } : {};
  return (
    <div
      className="font-mono text-sm text-gray-800 dark:text-gray-400"
      {...props}
    >
      {children}
    </div>
  );
};
