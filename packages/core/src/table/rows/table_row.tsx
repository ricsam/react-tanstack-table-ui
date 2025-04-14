import React from "react";
import { useTableProps } from "../hooks/use_table_props";
import { TableCell } from "../cols/table_cell";
import { VirtualRowContext } from "../contexts/virtual_row_context";
import { useTableContext } from "../table_context";
import { VirtualRow, VirtualCell } from "../types";

export const TableRow = function TableRow({
  row,
  offsetLeft,
  offsetRight,
}: {
  row: VirtualRow;
  offsetLeft: number;
  offsetRight: number;
}) {
  const { dndStyle, isDragging, flatIndex, isPinned, cells, rowVirtualizer } =
    row;
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
  const { isExpanded, subComponent } = useTableProps(() => {
    const subRowsLength = row.row().subRows.length;
    const rowIsExpanded = row.row().getIsExpanded();
    let subComponent: React.ReactNode | undefined;
    let isExpanded: boolean = Boolean(
      subRowsLength === 0 && rowIsExpanded && renderSubComponent,
    );

    if (isExpanded && renderSubComponent) {
      subComponent = renderSubComponent(row.row());
      if (subComponent) {
        isExpanded = true;
      }
    }
    return { isExpanded, subComponent };
  });

  const pinnedLeft = cells.filter((cell) => cell.vheader.isPinned === "start");
  const pinnedRight = cells.filter((cell) => cell.vheader.isPinned === "end");

  return (
    <>
      <VirtualRowContext.Provider value={row}>
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
            {pinnedLeft.length > 0 && (
              <skin.PinnedCols position="left" type={"body"}>
                {loop(pinnedLeft)}
              </skin.PinnedCols>
            )}
            <div
              style={{
                minWidth: offsetLeft,
                flexShrink: 0,
              }}
            ></div>
            {loop(cells.filter((cell) => !cell.vheader.isPinned))}
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
            {pinnedRight.length > 0 && (
              <skin.PinnedCols position="right" type={"body"}>
                {loop(pinnedRight)}
              </skin.PinnedCols>
            )}
          </skin.TableRow>
          {isExpanded && (
            <skin.TableRowExpandedContent>
              {subComponent}
            </skin.TableRowExpandedContent>
          )}
        </skin.TableRowWrapper>
      </VirtualRowContext.Provider>
    </>
  );
};
