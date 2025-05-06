import { shallowEqual, useRowProps, useRowRef } from "@rttui/core";
import { CellText } from "@/registry/new-york/rttui/rttui-cell-text";
import { CellTextBold } from "@/registry/new-york/rttui/rttui-cell-text-bold";
import { Checkbox } from "@/registry/new-york/rttui/rttui-checkbox";
import { ExpandButton } from "@/registry/new-york/rttui/rttui-expand-button";
import { RowPinButtons } from "@/registry/new-york/rttui/rttui-row-pin-buttons";

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
      style={{ paddingLeft: expandButton ? `${depth * 20}px` : "0px" }}
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
        <CellTextBold className="text-primary">{children}</CellTextBold>
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
