import { Box, BoxProps } from "@mui/material";
import { CellPercentProps } from "@rttui/core";
import React from "react";

/**
 * CellPercent component for the Bleu skin.
 * Formats a number as a percentage.
 */
export const CellPercent: React.FC<CellPercentProps & BoxProps> = ({
  value,
  fractionDigits = 2,
  ...props
}) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
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
