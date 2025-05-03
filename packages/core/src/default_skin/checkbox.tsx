"use client";
import React, { useLayoutEffect, useRef } from "react";
import { useTableProps } from "../table/hooks/use_table_props";
import { shallowEqual } from "../utils";

export const Checkbox = ({ getProps, onChange }: CheckboxProps) => {
  const resolvedRef = useRef<HTMLInputElement>(null);
  const { checked, indeterminate, disabled, value } = useTableProps({
    callback: () => {
      return getProps();
    },
    dependencies: [{ type: "tanstack_table" }],
    areCallbackOutputEqual: shallowEqual,
    shouldUnmount: () => {
      try {
        getProps();
        return false;
      } catch (e) {
        return true;
      }
    },
  });

  useLayoutEffect(() => {
    if (resolvedRef.current) {
      resolvedRef.current.indeterminate = !!indeterminate;
    }
  }, [resolvedRef, indeterminate]);

  return (
    <div
      style={{
        position: "relative",
        width: "1rem",
        height: "1rem",
        display: "grid",
        gridTemplateColumns: "1fr",
      }}
    >
      <input
        type="checkbox"
        style={{
          gridColumn: "1",
          gridRow: "1",
          appearance: "none",
          borderRadius: "0.25rem",
          border: `1px solid ${
            checked || indeterminate
              ? "var(--table-primary-color, #4f46e5)"
              : "var(--table-border-color, #d1d5db)"
          }`,
          backgroundColor:
            checked || indeterminate
              ? "var(--table-primary-color, #4f46e5)"
              : "white",
          width: "100%",
          height: "100%",
          margin: 0,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
        }}
        ref={resolvedRef}
        name={"checkbox"}
        checked={checked}
        onChange={
          onChange
            ? (ev) => {
                onChange()(ev);
              }
            : undefined
        }
        disabled={disabled}
        value={value}
      />
      <svg
        style={{
          pointerEvents: "none",
          gridColumn: "1",
          gridRow: "1",
          width: "0.875rem",
          height: "0.875rem",
          alignSelf: "center",
          justifySelf: "center",
          stroke: "white",
          opacity: (checked && !indeterminate) ? 1 : 0,
        }}
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M3 8L6 11L11 3.5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        style={{
          pointerEvents: "none",
          gridColumn: "1",
          gridRow: "1",
          width: "0.875rem",
          height: "0.875rem",
          alignSelf: "center",
          justifySelf: "center",
          stroke: "white",
          opacity: indeterminate ? 1 : 0,
        }}
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M3 7H11"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export interface CheckboxProps {
  getProps: () => {
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    value?: string;
  };
  onChange?: () => React.ChangeEventHandler<HTMLInputElement>;
}
