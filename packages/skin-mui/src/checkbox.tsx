import { CheckboxProps, shallowEqual, useTableProps } from "@rttui/core";
import { Checkbox as MuiCheckbox, SxProps, Theme } from "@mui/material";
import { ChangeEvent } from "react";

// Update CheckboxProps type if not already defined globally to include sx
interface CustomCheckboxProps extends CheckboxProps {
  sx?: SxProps<Theme>;
}

export const Checkbox = ({ getProps, onChange, sx }: CustomCheckboxProps) => {
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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange()(event);
    }
  };

  return (
    <MuiCheckbox
      sx={sx} // Apply the sx prop here
      checked={!!checked}
      indeterminate={!!indeterminate}
      disabled={!!disabled}
      value={value}
      onChange={onChange ? handleChange : undefined}
      inputProps={{ "aria-label": "controlled" }} // Add appropriate accessibility props if needed
    />
  );
};
