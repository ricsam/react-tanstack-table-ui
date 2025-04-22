import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import IconButton from "@mui/material/IconButton";
import { shallowEqual, useRowProps, useRowRef } from "@rttui/core";

// TODO: Implement MUI skin component
export function ExpandButton() {
  const { canExpand, isExpanded } = useRowProps({
    callback: (vrow) => {
      const row = vrow.row;
      return {
        canExpand: row.getCanExpand(),
        isExpanded: row.getIsExpanded(),
      };
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [{ type: "tanstack_table" }],
  });
  const rowRef = useRowRef();

  if (!canExpand) {
    return null;
  }

  return (
    <IconButton
      size="small"
      onClick={() => rowRef()?.row.toggleExpanded()}
      sx={{
        // Match size roughly to Tailwind reference (w-6 h-6)
        width: 24,
        height: 24,
      }}
    >
      {isExpanded ? (
        <KeyboardArrowDownIcon fontSize="small" />
      ) : (
        <KeyboardArrowRightIcon fontSize="small" />
      )}
    </IconButton>
  );
}
