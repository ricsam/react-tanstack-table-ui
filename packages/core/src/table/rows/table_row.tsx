import { Row } from "@tanstack/react-table";
import React, { CSSProperties } from "react";
import { DragAlongCell } from "../cols/drag_along_cell";
import { VirtualHeader } from "../cols/draggable_table_header";
import { useTableContext } from "../table_context";
import { PinPos } from "../types";
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
  const { rowHeight, skin } = useTableContext();
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

  const expandedRowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isExpanded) {
      const throttle = (fn: () => void, wait: number) => {
        let timeout: NodeJS.Timer;
        return () => {
          clearTimeout(timeout);
          timeout = setTimeout(fn, wait);
        };
      };

      const throttledResizeObserver = throttle(() => {
        if (expandedRowRef.current) {
          const { height } = expandedRowRef.current.getBoundingClientRect();
          console.log("height", height);
          rowVirtualizer.resizeItem(flatIndex, height + rowHeight);
        }
      }, 100);

      window.addEventListener("resize", throttledResizeObserver);
      return () =>
        window.removeEventListener("resize", throttledResizeObserver);
    }
  }, [isExpanded, rowHeight, rowVirtualizer, flatIndex]);

  return (
    <>
      <RowRefContext.Provider value={rowRef}>
        <skin.ExpandableTableRow
          isDragging={isDragging}
          isPinned={isPinned}
          flatIndex={flatIndex}
          dndStyle={dndStyle}
          ref={(el) => {
            rowRef.current = el;
          }}
        >
          {loop(
            headerGroup.headers.filter((cell) => cell.isPinned === "start"),
          )}
          <div style={{ width: headerGroup.offsetLeft }}></div>
          {loop(headerGroup.headers.filter((cell) => cell.isPinned === false))}
          <div style={{ width: headerGroup.offsetRight }}></div>
          {loop(headerGroup.headers.filter((cell) => cell.isPinned === "end"))}
        </skin.ExpandableTableRow>
        {isExpanded && (
          <skin.ExpandedRow ref={expandedRowRef}>
            {renderSubComponent({ row })}
          </skin.ExpandedRow>
        )}
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
