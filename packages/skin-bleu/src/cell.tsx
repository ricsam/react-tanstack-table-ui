import React from "react";
import { CellProps, shallowEqual, useRowProps, useRowRef } from "@rttui/core";
import { CellText } from "./cell_text";
import { CellTextBold } from "./cell_text_bold";
import { Checkbox } from "./checkbox";
import { ExpandButton } from "./expand_button";
import { RowPinButtons } from "./row_pin_buttons";
import { Resizer } from "./resizer";

export const Cell: React.FC<CellProps> = ({
  children,
  checkbox = false,
  expandButton = false,
  pinButtons = false,
  highlightSelected = false,
  resizer = false,
}) => {
  const { depth, isSelected } = useRowProps({
    callback: (vrow) => {
      const row = vrow.row;
      return {
        depth: row.depth,
        isSelected: row.getIsSelected(),
      };
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [{ type: "tanstack_table" }],
  });

  const rowRef = useRowRef();

  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    paddingLeft: expandButton ? `${depth * 20}px` : "0px",
  };

  const useBold = highlightSelected && isSelected;

  return (
    <div style={containerStyle}>
      {checkbox && (
        <Checkbox
          getProps={() => {
            const row = rowRef()?.row;
            if (!row) return {};
            return {
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
            };
          }}
          onChange={() => {
            // Return the actual handler function
            return (event: React.ChangeEvent<HTMLInputElement>) => {
              rowRef()?.row.toggleSelected(event.target.checked);
            };
          }}
        />
      )}
      {expandButton && <ExpandButton />}
      {pinButtons && <RowPinButtons />}
      {useBold ? (
        <CellTextBold className="bleu-selected-cell-text">
          {children}
        </CellTextBold>
      ) : (
        <CellText>{children}</CellText>
      )}
      {resizer && <Resizer />}
    </div>
  );
};
