import React from "react";
import { useRowProps, useRowRef, shallowEqual } from "@rttui/core";
import { FiChevronDown, FiChevronRight } from "react-icons/fi"; // Using react-icons as per guidelines

// No specific props needed for ExpandButton itself as it uses context hooks

// Implement the ExpandButton component for the Anocca skin
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

  // Basic button styling - Anocca skin will likely provide more specific styles
  const buttonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px", // Equivalent to w-6
    height: "24px", // Equivalent to h-6
    border: "none",
    background: "transparent",
    cursor: "pointer",
    borderRadius: "50%", // Equivalent to rounded-full
    // Placeholder hover effect - Anocca might use different colors or effects
    // ':hover': { backgroundColor: '#f3f4f6' }
    // Hover pseudo-class cannot be applied via inline styles directly
  };

  // Basic icon styling - Anocca might have specific icon colors/sizes
  const iconStyle: React.CSSProperties = {
    width: "16px", // Equivalent to w-4
    height: "16px", // Equivalent to h-4
    color: "#4b5563", // Placeholder color (text-gray-600)
  };

  const IconComponent = isExpanded ? FiChevronDown : FiChevronRight;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent row click event if needed
        rowRef()?.row.toggleExpanded();
      }}
      style={buttonStyle}
      aria-label={isExpanded ? "Collapse row" : "Expand row"}
    >
      <IconComponent style={iconStyle} />
    </button>
  );
}; 