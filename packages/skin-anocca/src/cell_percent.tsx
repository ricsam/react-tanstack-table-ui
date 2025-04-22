import { CellPercentProps } from "@rttui/core";
import React from "react";

/**
 * CellPercent component for the Anocca skin.
 * Formats a number as a percentage.
 */
export const CellPercent: React.FC<CellPercentProps> = ({
  value,
  fractionDigits = 2,
}) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  const defaultStyle: React.CSSProperties = {
    fontSize: "0.875rem", // text-sm
    color: "rgb(107 114 128)", // text-gray-500
    fontVariantNumeric: "tabular-nums",
    // Anocca doesn't have dark mode built-in like Tailwind,
    // so we only define the light mode color here.
  };

  return <span style={{ ...defaultStyle }}>{formatter.format(value)}</span>;
};
