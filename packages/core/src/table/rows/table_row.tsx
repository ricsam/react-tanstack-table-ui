import { Row } from "@tanstack/react-table";
import React, { CSSProperties } from "react";
import { VirtualCell } from "../cols/virtual_cell";
import { VirtualHeader } from "../cols/virtual_header/types";
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
  const { skin } = useTableContext();
  const rowRef = React.useRef<HTMLDivElement>(null);
  const { mainHeaderGroup: headerGroup, rowVirtualizer } = useRowContext();

  const loop = (headers: VirtualHeader[]) => {
    return (
      <>
        {headers.map((virtualHeader) => {
          const cell = visibileCells[virtualHeader.headerIndex];
          return (
            <VirtualCell key={cell.id} cell={cell} header={virtualHeader} />
          );
        })}
      </>
    );
  };

  const isExpanded = row.subRows.length === 0 && row.getIsExpanded();

  const stickyLeft = headerGroup.headers.filter(
    (header) => header.isPinned === "start",
  );
  const stickyRight = headerGroup.headers.filter(
    (header) => header.isPinned === "end",
  );

  return (
    <>
      <RowRefContext.Provider value={rowRef}>
        <skin.TableRowWrapper
          isDragging={isDragging}
          isPinned={isPinned}
          flatIndex={flatIndex}
          dndStyle={dndStyle}
          ref={(el) => {
            rowRef.current = el;
            if (isExpanded) {
              rowVirtualizer.measureElement(el);
            }
          }}
        >
          <skin.TableRow
            isDragging={isDragging}
            isPinned={isPinned}
            flatIndex={flatIndex}
          >
            <skin.PinnedCols
              position="left"
              pinned={stickyLeft}
              type={'body'}
            >
              {loop(stickyLeft)}
            </skin.PinnedCols>
            <div style={{ width: headerGroup.offsetLeft }}></div>
            {loop(
              headerGroup.headers.filter((cell) => cell.isPinned === false),
            )}
            <div style={{ width: headerGroup.offsetRight }}></div>
            <skin.PinnedCols
              position="right"
              pinned={stickyRight}
              type={'body'}
            >
              {loop(stickyRight)}
            </skin.PinnedCols>
          </skin.TableRow>
          {isExpanded && (
            <skin.TableRowExpandedContent>
              {renderSubComponent({ row })}
            </skin.TableRowExpandedContent>
          )}
        </skin.TableRowWrapper>
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
