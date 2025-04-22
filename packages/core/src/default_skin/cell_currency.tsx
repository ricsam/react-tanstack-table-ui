import React from "react";

export type CellCurrencyProps = {
  value: number;
  currency?: string;
  locale?: string;
  fractionDigits?: number;
};

export const CellCurrency: React.FC<CellCurrencyProps> = ({
  value,
  currency = "USD",
  locale = "en-US",
  fractionDigits = 2,
}) => {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
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