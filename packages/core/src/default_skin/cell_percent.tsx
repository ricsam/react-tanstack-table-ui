import React from "react";

export type CellPercentProps = {
  value: number;
  fractionDigits?: number;
};

// TODO: Implement default skin component
export const CellPercent: React.FC<CellPercentProps> = ({
  value,
  fractionDigits = 2,
}) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return (
    <span
      style={{
        fontSize: "var(--table-text-size, 0.875rem)",
        color: "var(--table-text-color, inherit)",
        fontVariantNumeric: "tabular-nums",
        textAlign: "right",
        display: "block",
      }}
    >
      {formatter.format(value)}
    </span>
  );
}; 