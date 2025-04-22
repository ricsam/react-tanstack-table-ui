import React from "react";
import { CellText } from "./cell_text";
import { CellTextBold } from "./cell_text_bold";
import { Checkbox } from "./checkbox";
import { ExpandButton } from "./expand_button";
import { RowPinButtons } from "./row_pin_buttons";
import { useRowProps } from "../table/hooks/use_row_props";
import { shallowEqual } from "../utils";
import { useRowRef } from "../table/hooks/use_row_ref";

export type CellProps = {
  children?: React.ReactNode;
  checkbox?: boolean;
  expandButton?: boolean;
  pinButtons?: boolean;
  highlightSelected?: boolean;
};
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        paddingLeft: `${depth * 20}px`,
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

      {/* Content */}
      {highlightSelected && checked ? (
        <CellTextBold
          style={{
            color: "var(--table-highlight-color, #4f46e5)",
          }}
        >
          {children}
        </CellTextBold>
      ) : (
        <CellText>{children}</CellText>
      )}
    </div>
  );
}
