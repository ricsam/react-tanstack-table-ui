import React from "react";
import { Column } from "@tanstack/react-table";

// Define the filter variant types
type FilterVariant = "text" | "range" | "select";

// Status options for the select filter
const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

// A debounced input component to prevent too many filter updates
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 300,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        React.startTransition(() => {
          onChange(e.target.value);
        });
      }}
    />
  );
}

// Main Filter component that handles different filter types
export function Filter({
  column,
  variant = "text",
}: {
  column: Column<any, unknown>;
  variant?: FilterVariant;
}) {
  const columnFilterValue = column.getFilterValue();

  // Text filter (default)
  if (variant === "text") {
    return (
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder="Search..."
        style={{
          width: "100%",
          padding: "6px 8px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          fontSize: "13px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      />
    );
  }

  // Range filter for numeric values
  if (variant === "range") {
    return (
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [
              value === "" ? undefined : Number(value),
              old?.[1],
            ])
          }
          placeholder="Min"
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "13px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        />
        <span style={{ fontWeight: "bold" }}>-</span>
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [
              old?.[0],
              value === "" ? undefined : Number(value),
            ])
          }
          placeholder="Max"
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "13px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        />
      </div>
    );
  }

  // Select filter for enum values
  if (variant === "select") {
    return (
      <select
        value={(columnFilterValue ?? "") as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        style={{
          width: "100%",
          padding: "6px 8px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          fontSize: "13px",
          backgroundColor: "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return null;
}
