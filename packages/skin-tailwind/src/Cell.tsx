import { useRowProps, useRowRef } from "@rttui/core";
import { CellText } from "./CellText";
import { CellTextBold } from "./CellTextBold";
import { Checkbox } from "./Checkbox";
import { ExpandButton } from "./ExpandButton";
import { RowPinButtons } from "./RowPinButtons";

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
  const { depth, checked } = useRowProps((row) => {
    return {
      depth: row.depth,
      checked: row.getIsSelected(),
    };
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
            const row = rowRef.current;
            return {
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
            };
          }}
          onChange={() => {
            return () => rowRef.current.toggleSelected();
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
