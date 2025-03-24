import { Row } from "@tanstack/react-table";
import React, { CSSProperties } from "react";
import { DragAlongCell } from "../cols/drag_along_cell";
import { VirtualHeader } from "../cols/draggable_table_header";
import { useTableContext } from "../table_context";
import { PinPos } from "./dnd/move_in_window";
import { useRowContext } from "./row_context";
import { RowRefContext } from "./row_ref_context";

export type VirtualRow = {
  dndStyle: CSSProperties;
  row: Row<any>;
  isDragging: boolean;
  isPinned: PinPos;
  flatIndex: number;
};

export const TableRow = React.memo(function TableRow({
  dndStyle,
  row,
  isDragging,
  flatIndex,
  isPinned,
}: VirtualRow) {
  const visibileCells = row.getVisibleCells();
  const { rowHeight } = useTableContext();
  const rowRef = React.useRef<HTMLDivElement>(null);
  const { mainHeaderGroup: headerGroup, rowVirtualizer } = useRowContext();

  const loop = (headers: VirtualHeader[]) => {
    return (
      <>
        {headers.map((virtualHeader) => {
          const cell = visibileCells[virtualHeader.colIndex];
          return (
            <DragAlongCell
              key={cell.id}
              cell={cell}
              header={virtualHeader}
              rowHeight={rowHeight}
            />
          );
        })}
      </>
    );
  };

  const isExpanded = row.subRows.length === 0 && row.getIsExpanded();

  const { table } = useTableContext();

  return (
    <>
      <RowRefContext.Provider value={rowRef}>
        <div
          className="table-row"
          style={{
            position: "relative",
            opacity: isDragging ? 0.8 : 1,
            zIndex: isDragging ? 1 : 0,
            width: table.getTotalSize(),
            backgroundColor: flatIndex % 2 === 0 ? "black" : "#191919",
            ...dndStyle,
          }}
          data-index={flatIndex}
          ref={(el) => {
            rowRef.current = el;
            if (isExpanded) {
              rowVirtualizer.measureElement(el);
            }
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              width: table.getTotalSize(),
              height: rowHeight,
            }}
          >
            {loop(
              headerGroup.headers.filter((cell) => cell.isPinned === "start"),
            )}
            <div style={{ width: headerGroup.offsetLeft }}></div>
            {loop(
              headerGroup.headers.filter((cell) => cell.isPinned === false),
            )}
            <div style={{ width: headerGroup.offsetRight }}></div>
            {loop(
              headerGroup.headers.filter((cell) => cell.isPinned === "end"),
            )}
          </div>
          {isExpanded && <div>{renderSubComponent({ row })}</div>}
        </div>
      </RowRefContext.Provider>
    </>
  );
});

const renderSubComponent = ({ row }: { row: Row<any> }) => {
  return (
    <pre style={{ fontSize: "10px", textAlign: "left" }}>
      <code>{JSON.stringify(row.original, null, 2)}</code>
    </pre>
  );
};
