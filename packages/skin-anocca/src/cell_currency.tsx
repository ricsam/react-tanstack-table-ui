import { CellCurrencyProps } from "@rttui/core";
import React from "react";

// Implement the CellCurrency component for the Anocca skin
export const CellCurrency: React.FC<CellCurrencyProps> = ({
  value,
  currency = "USD", // Default to USD if no currency is provided
}) => {
  // Use Intl.NumberFormat for robust currency formatting
  // The locale ('en-US') can be adjusted if needed, or made dynamic
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2, // Standard practice for currency
    maximumFractionDigits: 2,
  });

  // Apply styling similar to CellNumber for consistency
  const style: React.CSSProperties = {
    fontSize: "0.875rem", // Equivalent to text-sm
    color: "#6b7280", // Equivalent to text-gray-500 (Placeholder)
    fontVariantNumeric: "tabular-nums", // Align numbers
    // Anocca skin might specify different colors, alignment, etc.
  };

  return <span style={style}>{formatter.format(value)}</span>;
}; 