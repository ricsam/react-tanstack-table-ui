import React from "react";
import { TableRow } from "./rows/table_row";
import { useTableContext } from "./table_context";
import { VirtualRow } from "./types";
export const TableBody = React.memo(
  ({
    rows,
    offsetBottom,
    offsetTop,
    offsetLeft,
    offsetRight,
  }: {
    rows: VirtualRow[];
    offsetTop: number;
    offsetBottom: number;
    offsetLeft: number;
    offsetRight: number;
  }) => {
    const { skin, pinRowsRelativeTo } = useTableContext();

    const loop = (rows: VirtualRow[]) => {
      return (
        <>
          {rows.map((virtualRow) => {
            return (
              <TableRow
                key={virtualRow.id}
                row={virtualRow}
                offsetLeft={offsetLeft}
                offsetRight={offsetRight}
              />
            );
          })}
        </>
      );
    };

    const pinnedTop = rows.filter((row) => row.isPinned === "start");
    const pinnedBottom = rows.filter((row) => row.isPinned === "end");

    return (
      <skin.TableBody>
        {pinnedTop.length > 0 && (
          <skin.PinnedRows position="top">{loop(pinnedTop)}</skin.PinnedRows>
        )}

        <div
          style={{ height: offsetTop, flexShrink: 0 }}
          className="offset-top"
        ></div>

        {loop(rows.filter((row) => row.isPinned === false))}

        <div
          style={
            pinRowsRelativeTo === "rows"
              ? { height: offsetBottom, flexShrink: 0 }
              : { minHeight: offsetBottom, flexShrink: 0, flexGrow: 1 }
          }
          className="offset-bottom"
        ></div>

        {pinnedBottom.length > 0 && (
          <skin.PinnedRows position="bottom">
            {loop(pinnedBottom)}
          </skin.PinnedRows>
        )}
      </skin.TableBody>
    );
  },
);
