import React from "react";
import { CellNumber } from "./cell_number"; // Reuse CellNumber for styling

// TODO: Implement MUI skin component
export const CellCurrency: React.FC<{ value: number; currency?: string }> = ({
  value,
  currency = "USD",
}) => {
  // Use Intl.NumberFormat for currency formatting
  const formatter = React.useMemo(() => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }), [currency]);

  return <CellNumber>{formatter.format(value)}</CellNumber>;
}; 