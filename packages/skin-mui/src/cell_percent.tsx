import React from "react";
import Typography from "@mui/material/Typography";

// TODO: Implement MUI skin component
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
    <Typography
      variant="body2" // text-sm
      component="span"
      sx={{
        color: "text.secondary", // text-gray-500
        fontVariantNumeric: "tabular-nums", // tabular-nums
      }}
    >
      {formatter.format(value)}
    </Typography>
  );
}; 