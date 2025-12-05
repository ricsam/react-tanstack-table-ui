import { CellCurrencyProps } from "@rttui/core";
import { Box, BoxProps } from "@mui/material";
import React from "react";

// Implement the CellCurrency component for the Bleu skin
export const CellCurrency: React.FC<CellCurrencyProps & BoxProps> = ({
  value,
  currency = "USD", // Default to USD if no currency is provided
  ...props
}) => {
  // Use Intl.NumberFormat for robust currency formatting
  // The locale ('en-US') can be adjusted if needed, or made dynamic
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2, // Standard practice for currency
    maximumFractionDigits: 2,
  });

  return (
    <Box
      component="span"
      sx={{
        fontSize: (theme) => theme.typography.body1.fontSize,
        color: "text.secondary",
        fontVariantNumeric: "tabular-nums",
      }}
      {...props}
    >
      {formatter.format(value)}
    </Box>
  );
};
