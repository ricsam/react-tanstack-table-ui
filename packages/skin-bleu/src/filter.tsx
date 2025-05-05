import { Input } from "@mui/material";
import { shallowEqual, useColProps, useColRef } from "@rttui/core";
import React from "react";

export function Filter() {
  const { filterValue, canFilter } = useColProps({
    callback: ({ column }) => {
      return {
        filterValue: (column.getFilterValue() ?? "") as string,
        canFilter: column.getCanFilter(),
      };
    },
    dependencies: [{ type: "tanstack_table" }],
    areCallbackOutputEqual: shallowEqual,
  });
  const colRef = useColRef();

  if (!canFilter) {
    return null;
  }

  return (
    <Input
      size="small"
      fullWidth
      sx={{
        minWidth: "120px",
      }}
      value={filterValue}
      onChange={(e) => {
        React.startTransition(() => {
          colRef().column?.setFilterValue(e.target.value);
        });
      }}
    />
  );
}
