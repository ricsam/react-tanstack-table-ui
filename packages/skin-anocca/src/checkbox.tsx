import React, { useLayoutEffect, useRef } from "react";
import { CheckboxProps, shallowEqual, useTableProps } from "@rttui/core";

// Implement the Checkbox component for the Anocca skin
export const Checkbox: React.FC<CheckboxProps> = ({ getProps, onChange }) => {
  const resolvedRef = useRef<HTMLInputElement>(null);

  // Use the core hook to get checkbox state based on table context
  const { checked, indeterminate, disabled, value } = useTableProps({
    callback: () => {
      // getProps is expected to return the state { checked, indeterminate, disabled, value }
      // This allows the checkbox to reflect header/row/cell specific selection states
      return getProps();
    },
    dependencies: [{ type: "tanstack_table" }], // Re-evaluate when table state changes
    areCallbackOutputEqual: shallowEqual, // Optimize re-renders
    shouldUnmount: () => {
      // Attempt to call getProps to see if the context is still valid
      // If it throws (e.g., row is removed), the component should unmount
      try {
        getProps();
        return false;
      } catch (e) {
        return true;
      }
    },
  });

  // Apply indeterminate state imperatively
  useLayoutEffect(() => {
    if (resolvedRef.current) {
      resolvedRef.current.indeterminate = !!indeterminate;
    }
  }, [resolvedRef, indeterminate]);

  // Basic styling for the checkbox - Anocca skin might provide custom styling
  const style: React.CSSProperties = {
    width: "16px", // Equivalent to size-4
    height: "16px",
    cursor: disabled ? "not-allowed" : "pointer",
    // Add some margin for spacing if needed
    margin: "auto", // Center it if used within a flex/grid container
  };

  return (
    <input
      type="checkbox"
      ref={resolvedRef}
      style={style}
      checked={!!checked} // Ensure checked is boolean
      onChange={
        onChange
          ? (ev) => {
              // The onChange from props returns the actual handler function
              onChange()(ev);
            }
          : undefined
      }
      disabled={disabled}
      value={value}
      aria-checked={indeterminate ? "mixed" : checked ? "true" : "false"}
    />
  );
}; 