import { shallowEqual, useRowProps, useRowRef } from "@rttui/core";
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
}: {
  children?: React.ReactNode;
  checkbox?: boolean;
  expandButton?: boolean;
  pinButtons?: boolean;
  highlightSelected?: boolean;
}) {
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
      className="flex items-center gap-2"
      style={{ paddingLeft: `${depth * 20}px` }}
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
        <CellTextBold className="text-indigo-600 dark:text-indigo-500">
          {children}
        </CellTextBold>
      ) : (
        <CellText>{children}</CellText>
      )}
    </div>
  );
}
