import { Checkbox as MuiCheckbox } from "@mui/material";
import { CheckboxProps, shallowEqual, useTableProps } from "@rttui/core";
import React from "react";

// Implement the Checkbox component for the Bleu skin
export const Checkbox: React.FC<CheckboxProps> = ({ getProps, onChange }) => {
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

  return (
    <MuiCheckbox
      size="small"
      name="select-row"
      checked={!!checked}
      indeterminate={!!indeterminate}
      disabled={disabled}
      value={value}
      onClick={(ev) => {
        ev.stopPropagation();
      }}
      onChange={
        onChange
          ? (ev) => {
              // The onChange from props returns the actual handler function
              onChange()(ev);
            }
          : undefined
      }
      sx={{
        padding: 0,
        "& .MuiSvgIcon-root": {
          fontSize: "16px",
        },
      }}
    />
  );
};
