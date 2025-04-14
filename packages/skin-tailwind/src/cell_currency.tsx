import React from "react";


export const CellCurrency: React.FC<{ value: number; currency?: string; }> = ({
  value, currency = "USD",
}) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });

  return (
    <span className="text-sm text-gray-500 dark:text-gray-300 tabular-nums">
      {formatter.format(value)}
    </span>
  );
};
