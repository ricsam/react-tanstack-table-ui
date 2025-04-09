import { Row } from "@tanstack/react-table";
import { Checkbox } from "./Checkbox";
import { RowPinButtons } from "./RowPinButtons";
import { ExpandButton } from "./ExpandButton";
import { CellTextBold } from "./CellTextBold";
import { CellText } from "./CellText";

export function Cell({
  row,
  children,
  checkbox,
  expandButton,
  pinButtons,
  highlightSelected,
}: {
  row: Row<any>;
  children?: React.ReactNode;
  checkbox?: boolean;
  expandButton?: boolean;
  pinButtons?: boolean;
  highlightSelected?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2"
      style={{ paddingLeft: `${row.depth * 20}px` }}
    >
      {checkbox && (
        <Checkbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
          }}
        />
      )}

      {expandButton && <ExpandButton row={row} />}
      {pinButtons && <RowPinButtons row={row} />}

      {/* Name content */}
      {highlightSelected && row.getIsSelected() ? (
        <CellTextBold className="text-indigo-600 dark:text-indigo-500">
          {children}
        </CellTextBold>
      ) : (
        <CellText>{children}</CellText>
      )}
    </div>
  );
}
