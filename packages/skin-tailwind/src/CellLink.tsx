import React from "react";


export const CellLink: React.FC<{
  href: string;
  children: React.ReactNode;
  srText?: string;
}> = ({ href, children, srText }) => {
  return (
    <a
      href={href}
      className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
    >
      {children}
      {srText && <span className="sr-only">, {srText}</span>}
    </a>
  );
};
