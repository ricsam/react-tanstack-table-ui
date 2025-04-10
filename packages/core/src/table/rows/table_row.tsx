import { Cell, Row } from "@tanstack/react-table";
import { Virtualizer } from "@tanstack/react-virtual";
import React, { CSSProperties } from "react";
import { TableCell } from "../cols/table_cell";
import { useTableContext } from "../table_context";
import { PinPos } from "../types";
import { RowContext } from "./row_context";
import { RowRefContext } from "./row_ref_context";

export type VirtualCell = {
  id: string;
  columnId: string;
  width: number;
  start: number;
  end: number;
  isPinned: PinPos;
  isLastPinned: boolean;
  isFirstPinned: boolean;
  isLast: boolean;
  isFirst: boolean;
  isFirstCenter: boolean;
  isLastCenter: boolean;
  cell: Cell<any, any>;
  dndStyle: CSSProperties;
};

export type VirtualRow = {
  dndStyle: CSSProperties;
  row: Row<any>;
  isDragging: boolean;
  isPinned: PinPos;
  flatIndex: number;
  cells: VirtualCell[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
};

export const TableRow = React.memo(function TableRow({
  row: {
    dndStyle,
    row,
    isDragging,
    flatIndex,
    isPinned,
    cells,
    rowVirtualizer,
  },
  offsetLeft,
  offsetRight,
}: {
  row: VirtualRow;
  offsetLeft: number;
  offsetRight: number;
}) {
  const { skin, renderSubComponent, pinColsRelativeTo } = useTableContext();
  const rowRef = React.useRef<HTMLDivElement>(null);

  const loop = (cells: VirtualCell[]) => {
    return (
      <>
        {cells.map((virtualCell) => {
          return <TableCell key={virtualCell.id} cell={virtualCell} />;
        })}
      </>
    );
  };
  let subComponent: React.ReactNode | undefined;
  let isExpanded: boolean = Boolean(
    row.subRows.length === 0 && row.getIsExpanded() && renderSubComponent,
  );

  if (isExpanded && renderSubComponent) {
    subComponent = renderSubComponent({ row });
    if (subComponent) {
      isExpanded = true;
    }
  }

  const stickyLeft = cells.filter((cell) => cell.isPinned === "start");
  const stickyRight = cells.filter((cell) => cell.isPinned === "end");

  return (
    <>
      <RowRefContext.Provider value={rowRef}>
        <RowContext.Provider value={React.useMemo(() => ({ row }), [row])}>
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
                type={"body"}
              >
                {loop(stickyLeft)}
              </skin.PinnedCols>
              <div
                style={{
                  minWidth: offsetLeft,
                  flexShrink: 0,
                }}
              ></div>
              {loop(cells.filter((cell) => cell.isPinned === false))}
              <div
                style={
                  pinColsRelativeTo === "table"
                    ? {
                        minWidth: offsetRight,
                        flexShrink: 0,
                        flexGrow: 1,
                      }
                    : {
                        width: offsetRight,
                        flexShrink: 0,
                      }
                }
              ></div>
              <skin.PinnedCols
                position="right"
                pinned={stickyRight}
                type={"body"}
              >
                {loop(stickyRight)}
              </skin.PinnedCols>
            </skin.TableRow>
            {isExpanded && (
              <skin.TableRowExpandedContent>
                {subComponent}
              </skin.TableRowExpandedContent>
            )}
          </skin.TableRowWrapper>
        </RowContext.Provider>
      </RowRefContext.Provider>
    </>
  );
});
