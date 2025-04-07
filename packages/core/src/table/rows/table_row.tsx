import { Row } from "@tanstack/react-table";
import React, { CSSProperties } from "react";
import { VirtualCell } from "../cols/virtual_cell";
import { VirtualHeader } from "../cols/virtual_header/types";
import { useTableContext } from "../table_context";
import { PinPos } from "../types";
import { useVirtualRowContext } from "./virtual_row_context";
import { RowRefContext } from "./row_ref_context";
import { RowContext } from "./row_context";

export type VirtualRow = {
  dndStyle: CSSProperties;
  row: Row<any>;
  isDragging: boolean;
  isPinned: PinPos;
  flatIndex: number;
};

export const TableRow = function TableRow({
  dndStyle,
  row,
  isDragging,
  flatIndex,
  isPinned,
}: VirtualRow) {
  const visibileCells = row.getVisibleCells();
  const { skin, renderSubComponent, pinColsRelativeTo } = useTableContext();
  const rowRef = React.useRef<HTMLDivElement>(null);
  const { mainHeaderGroup: headerGroup, rowVirtualizer } =
    useVirtualRowContext();

  const allHeaders = headerGroup.headers;

  const loop = (headers: VirtualHeader[], pinned: PinPos) => {
    return (
      <>
        {headers.map((virtualHeader, index) => {
          const cell = visibileCells[virtualHeader.headerIndex];
          let isLastPinned = false;
          let isFirstPinned = false;
          if (pinned === "start") {
            isLastPinned = index === headers.length - 1;
            isFirstPinned = index === 0;
          } else if (pinned === "end") {
            isLastPinned = index === 0;
            isFirstPinned = index === headers.length - 1;
          }
          let isLast = false;
          let isFirst = false;
          if (allHeaders[0].headerId === virtualHeader.headerId) {
            isFirst = true;
          }
          if (
            allHeaders[allHeaders.length - 1].headerId ===
            virtualHeader.headerId
          ) {
            isLast = true;
          }
          let isFirstCenter = false;
          let isLastCenter = false;
          if (pinned === false) {
            isLastCenter = index === headers.length - 1;
            isFirstCenter = index === 0;
          }

          return (
            <VirtualCell
              key={cell.id}
              cell={cell}
              header={virtualHeader}
              isLastPinned={isLastPinned}
              isFirstPinned={isFirstPinned}
              isLast={isLast}
              isFirst={isFirst}
              isFirstCenter={isFirstCenter}
              isLastCenter={isLastCenter}
            />
          );
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

  const stickyLeft = headerGroup.headers.filter(
    (header) => header.isPinned === "start",
  );
  const stickyRight = headerGroup.headers.filter(
    (header) => header.isPinned === "end",
  );

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
                {loop(stickyLeft, "start")}
              </skin.PinnedCols>
              <div
                style={{
                  minWidth: headerGroup.offsetLeft,
                  flexShrink: 0,
                }}
              ></div>
              {loop(
                headerGroup.headers.filter((cell) => cell.isPinned === false),
                false,
              )}
              <div
                style={
                  pinColsRelativeTo === "table"
                    ? {
                        minWidth: headerGroup.offsetRight,
                        flexShrink: 0,
                        flexGrow: 1,
                      }
                    : {
                        width: headerGroup.offsetRight,
                        flexShrink: 0,
                      }
                }
              ></div>
              <skin.PinnedCols
                position="right"
                pinned={stickyRight}
                type={"body"}
              >
                {loop(stickyRight, "end")}
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
};
