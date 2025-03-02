import { Row } from "@tanstack/react-table";
import { VirtualItem } from "../react-virtual";
import { getColVirtualizedOffsets } from "./get_col_virtualized_offset";
import { TableRow } from "./table_row";

export const TableBody = ({
  virtualColumns,
  virtualRows,
  rows,
  measureElement,
  width,
  totalWidth,
  totalHeight,
  rowHeight,
  rowIds,
}: {
  virtualColumns: VirtualItem[];
  virtualRows: VirtualItem[];
  rows: Row<any>[];
  measureElement: (el?: HTMLElement | null) => void;
  width: number;
  totalWidth: number;
  totalHeight: number;
  rowHeight: number;
  rowIds: string[];
}) => {
  const { offsetLeft: offsetTop, offsetRight: offsetBottom } =
    getColVirtualizedOffsets({
      virtualColumns: virtualRows,
      getIsPinned(vcIndex) {
        const row = rows[vcIndex];
        return !!row.getIsPinned();
      },
      totalSize: totalHeight,
    });

  const loop = (predicate: (header: Row<any>) => boolean) => {
    return (
      <>
        {virtualRows
          .map((virtualRow) => ({
            row: rows[virtualRow.index],
            start: virtualRow.start,
          }))
          .filter(({ row }) => predicate(row))
          .map(({ row, start }) => {
            return (
              <TableRow
                key={row.id}
                row={row}
                virtualColumns={virtualColumns}
                measureElement={measureElement}
                width={width}
                totalSize={totalWidth}
                rowHeight={rowHeight}
                flatIndex={rowIds.indexOf(row.id)}
              />
            );
          })}
      </>
    );
  };
  // console.log("@offsetBottom", offsetBottom);

  return (
    <div
      className="tbody"
      style={{
        // maxWidth: table.getTotalSize(),
        position: "relative",
        // transform: `translate3d(0, calc(var(--virtual-offset-top, 0) * 1px), 0)`,
        // top: virtualRows[0].start,
        width,
      }}
    >
      {loop((row) => row.getIsPinned() === "top")}
      <div style={{ height: offsetTop }} className="offset-top"></div>
      {loop((row) => row.getIsPinned() === false)}
      <div style={{ height: offsetBottom }} className="offset-bottom"></div>
      {loop((row) => row.getIsPinned() === "bottom")}

      {/* {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index];

        return (
          <TableRow
            key={row.id}
            row={row}
            virtualOffsetTop={virtualRow.start}
            virtualColumns={virtualColumns}
            measureElement={measureElement}
            width={width}
            totalSize={totalSize}
          />
        );
      })} */}
    </div>
  );
};
