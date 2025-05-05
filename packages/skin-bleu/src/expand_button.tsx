import { IconButton } from "@mui/material";
import { shallowEqual, useRowProps, useRowRef } from "@rttui/core";
import React from "react";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md"; // Using react-icons as per guidelines

// No specific props needed for ExpandButton itself as it uses context hooks

// Implement the ExpandButton component for the Bleu skin
export const ExpandButton: React.FC = () => {
  // Use core hooks to get row expansion state
  const { canExpand, isExpanded } = useRowProps({
    callback: (vrow) => {
      const row = vrow.row;
      return {
        canExpand: row.getCanExpand(),
        isExpanded: row.getIsExpanded(),
      };
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [{ type: "tanstack_table" }], // Dependency on table state changes
  });

  const rowRef = useRowRef(); // Get a ref to the row API

  // If the row cannot be expanded, render nothing
  if (!canExpand) {
    return null;
  }

  const IconComponent = isExpanded
    ? MdOutlineKeyboardArrowDown
    : MdOutlineKeyboardArrowRight;

  return (
    <IconButton
      size="small"
      onClick={(e) => {
        e.stopPropagation(); // Prevent row click event if needed
        rowRef()?.row.toggleExpanded();
      }}
      sx={{ color: "text.secondary" }}
    >
      <IconComponent size={16} />
    </IconButton>
  );
};
