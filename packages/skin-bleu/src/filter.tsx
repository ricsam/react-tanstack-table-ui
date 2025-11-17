import { Box, Input } from "@mui/material";
import { shallowEqual, useColProps, useColRef } from "@rttui/core";
import React from "react";
import { Resizer } from "./resizer";
import { useSelectionManagerCls } from "./selection_manager_context";

export function Filter({ resizer }: { resizer?: boolean }) {
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
  const selectionManager = useSelectionManagerCls();

  if (!canFilter && !resizer) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flex: 1,
      }}
    >
      {canFilter && (
        <Input
          size="small"
          fullWidth
          sx={{
            minWidth: "120px",
          }}
          value={filterValue}
          onFocus={() => {
            selectionManager.blur();
          }}
          onChange={(e) => {
            e.preventDefault();
            React.startTransition(() => {
              colRef().column?.setFilterValue(e.target.value);
            });
          }}
        />
      )}
      {resizer && <Box sx={{ flex: 1 }} />}
      {resizer && <Resizer />}
    </Box>
  );
}
