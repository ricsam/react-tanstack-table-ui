import { shallowEqual, useRowProps, useRowRef } from "@rttui/core";
import { CellText } from "@/components/rttui-cell-text";
import { CellTextBold } from "@/components/rttui-cell-text-bold";
import { Checkbox } from "@/components/rttui-checkbox";
import { ExpandButton } from "@/components/rttui-expand-button";
import { RowPinButtons } from "@/components/rttui-row-pin-buttons";

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
      className="flex items-center gap-2 flex-1 flex-shrink-0"
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
      {/* Name content */}
      {highlightSelected && checked ? (
        <CellTextBold className="text-primary">
          {children}
        </CellTextBold>
      ) : (
        <CellText>{children}</CellText>
      )}
      <div className="flex-1" />
      {pinButtons && (
        <>
          <RowPinButtons />
        </>
      )}
    </div>
  );
}
