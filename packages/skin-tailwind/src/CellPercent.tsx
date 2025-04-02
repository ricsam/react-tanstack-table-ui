import React from "react";


export const CellPercent: React.FC<{
  value: number;
  fractionDigits?: number;
}> = ({ value, fractionDigits = 2 }) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return (
    <span className="text-sm text-gray-500 dark:text-gray-300 tabular-nums">
      {formatter.format(value)}
    </span>
  );
};
