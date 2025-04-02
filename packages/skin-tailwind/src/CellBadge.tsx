import React from "react";


export const CellBadge: React.FC<{
  children: React.ReactNode;
  color?: "gray" |
  "red" |
  "yellow" |
  "green" |
  "blue" |
  "indigo" |
  "purple" |
  "pink";
}> = ({ children, color = "gray" }) => {
  const colorClasses = {
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-400",
    red: "bg-red-100 text-red-800 dark:bg-rose-400/10 dark:text-rose-400",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-400",
    green: "bg-green-100 text-green-800 dark:bg-green-400/10 dark:text-green-400",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-400",
    indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/10 dark:text-indigo-400",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-400/10 dark:text-purple-400",
    pink: "bg-pink-100 text-pink-800 dark:bg-pink-400/10 dark:text-pink-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
};
