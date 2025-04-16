import React from "react";
import { TableRow } from "./rows/table_row";
import { useTableContext } from "./table_context";
import { PinPos, VirtualRow } from "./types";
import { useTableProps } from "./hooks/use_table_props";
import { VerOffsets } from "./rows/row_virtualizer_context_type";
export const TableBody = React.memo(
  ({
    getRows,
    getVerOffsets,
  }: {
    getRows: () => VirtualRow[];
    getVerOffsets: () => VerOffsets;
  }) => {
    const { skin, pinRowsRelativeTo } = useTableContext();

    const { offsetTop, offsetBottom } = useTableProps(
      () => {
        const { offsetTop, offsetBottom } = getVerOffsets();
        return {
          offsetTop,
          offsetBottom,
        };
      },
      {
        dependencies: ["table", "row_offsets"],
      },
    );

    const rowLen = useTableProps(
      () => {
        return getRows().length;
      },
      {
        dependencies: ["table", "row_visible_range"],
      },
    );

    if (rowLen === 0) {
      return null;
    }

    return (
      <skin.TableBody>
        <RowsSlice getRows={getRows} pinPos="start" />

        <div
          style={{ height: offsetTop, flexShrink: 0 }}
          className="offset-top"
        />

        <RowsSlice getRows={getRows} pinPos={false} />

        <div
          style={
            pinRowsRelativeTo === "rows"
              ? { height: offsetBottom, flexShrink: 0 }
              : { minHeight: offsetBottom, flexShrink: 0, flexGrow: 1 }
          }
          className="offset-bottom"
        />

        <RowsSlice getRows={getRows} pinPos="end" />
      </skin.TableBody>
    );
  },
);

const RowsSlice = React.memo(function RowsSlice({
  getRows,
  pinPos,
}: {
  getRows: () => VirtualRow[];
  pinPos: PinPos;
}) {
  const { skin } = useTableContext();
  const { rows } = useTableProps(
    () => {
      let cacheKey = "";
      const rows = getRows().filter((row) => {
        const isPinned = row.isPinned();
        const result = isPinned === pinPos;
        if (result) {
          cacheKey += `${row.id},`;
        }
        return result;
      });
      return {
        rows,
        cacheKey,
      };
    },
    {
      dependencies: ["row_visible_range", "table"],
      arePropsEqual: (prev, next) => {
        return prev.cacheKey === next.cacheKey;
      },
    },
  );
  if (rows.length === 0) {
    return null;
  }
  const base = (
    <>
      {rows.map((virtualRow) => {
        return <TableRow key={virtualRow.id} row={virtualRow} />;
      })}
    </>
  );
  if (pinPos === "start") {
    return <skin.PinnedRows position="top">{base}</skin.PinnedRows>;
  }
  if (pinPos === "end") {
    return <skin.PinnedRows position="bottom">{base}</skin.PinnedRows>;
  }
  return base;
});
