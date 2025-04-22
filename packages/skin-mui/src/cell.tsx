import { Box } from "@mui/material";
import { CellProps, shallowEqual, useRowProps, useRowRef } from "@rttui/core";
import { CellText } from "./cell_text";
import { CellTextBold } from "./cell_text_bold";
import { Checkbox } from "./checkbox";
import { ExpandButton } from "./expand_button";
import { RowPinButtons } from "./row_pin_buttons";

export function Cell({
  children,
  checkbox,
  expandButton,
  pinButtons,
  highlightSelected,
}: CellProps) {
  const { depth, checked } = useRowProps({
    callback: (vrow) => {
      const row = vrow.row;
      return {
        depth: row.depth,
        checked: row.getIsSelected(),
      };
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [{ type: "tanstack_table" }],
  });
  const rowRef = useRowRef();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1, // Use theme spacing
        paddingLeft: `${depth * 24}px`, // Match Tailwind's padding
      }}
    >
      {checkbox && (
        <Checkbox
          getProps={() => {
            const row = rowRef()?.row;
            if (!row) {
              return {};
            }
            return {
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
            };
          }}
          onChange={() => {
            return () => {
              const row = rowRef()?.row;
              if (!row) {
                return;
              }
              return row.toggleSelected();
            };
          }}
        />
      )}

      {expandButton && <ExpandButton />}
      {pinButtons && <RowPinButtons />}

      {/* Name content */}
      {highlightSelected && checked ? (
        // Assuming CellTextBold applies appropriate styling
        <CellTextBold
          sx={{
            color: "primary.main", // Use theme primary color for highlight
          }}
        >
          {children}
        </CellTextBold>
      ) : (
        <CellText>{children}</CellText>
      )}
    </Box>
  );
}
