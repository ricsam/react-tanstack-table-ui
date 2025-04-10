import React from "react";
import { TableRow, VirtualRow } from "./rows/table_row";
import { useTableContext } from "./table_context";

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
                key={virtualRow.row.id}
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
        <skin.PinnedRows position="top" pinned={pinnedTop}>
          {loop(pinnedTop)}
        </skin.PinnedRows>

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

        <skin.PinnedRows position="bottom" pinned={pinnedBottom}>
          {loop(pinnedBottom)}
        </skin.PinnedRows>
      </skin.TableBody>
    );
  },
);
