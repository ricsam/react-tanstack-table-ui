import React from "react";
import { TableCell } from "../cols/table_cell";
import { VirtualRowContext } from "../contexts/virtual_row_context";
import { useRowVirtualizer } from "../hooks/use_row_virtualizer";
import { useTableProps } from "../hooks/use_table_props";
import { useTableContext } from "../table_context";
import { PinPos, VirtualCell, VirtualRow } from "../types";

export const TableRow = function TableRow({ row }: { row: VirtualRow }) {
  const { rowVirtualizer } = row;
  const { getHorizontalOffsets } = useRowVirtualizer();
  const { skin, renderSubComponent, pinColsRelativeTo } = useTableContext();
  const rowRef = React.useRef<HTMLDivElement>(null);

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

  const { offsetLeft, offsetRight } = useTableProps(
    () => {
      const { offsetLeft, offsetRight } = getHorizontalOffsets();
      return {
        offsetLeft,
        offsetRight,
      };
    },
    {
      dependencies: [
        { type: "table" },
        {
          type: "col_offsets_main",
        },
      ],
    },
  );

  const vrowRef = React.useRef<VirtualRow>(row);
  vrowRef.current = row;

  const getCells = React.useCallback(() => {
    return vrowRef.current.getCells();
  }, []);

  return (
    <>
      <VirtualRowContext.Provider value={row}>
        <skin.TableRowWrapper
          flatIndex={row.flatIndex}
          ref={(el) => {
            rowRef.current = el;
            if (isExpanded) {
              rowVirtualizer.measureElement(el);
            }
          }}
        >
          <skin.TableRow flatIndex={row.flatIndex}>
            <ColSlice getCells={getCells} pinPos="start" />
            <div
              style={{
                minWidth: offsetLeft,
                flexShrink: 0,
              }}
            ></div>
            <ColSlice getCells={getCells} pinPos={false} />
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
            <ColSlice getCells={getCells} pinPos="end" />
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

const ColSlice = React.memo(
  ({ getCells, pinPos }: { getCells: () => VirtualCell[]; pinPos: PinPos }) => {
    const { skin } = useTableContext();
    const { cells } = useTableProps(
      () => {
        let cacheKey = "";
        const cells = getCells().filter((cell) => {
          const result = cell.vheader.getState().isPinned === pinPos;
          if (result) {
            cacheKey += `${cell.id},`;
          }
          return result;
        });

        return {
          cells,
          cacheKey,
        };
      },
      {
        dependencies: [{ type: "table" }, { type: "col_visible_range_main" }],
        arePropsEqual: (prev, next) => {
          return prev.cacheKey === next.cacheKey;
        },
      },
    );

    if (cells.length === 0) {
      return null;
    }
    const base = (
      <>
        {cells.map((cell) => {
          return <TableCell key={cell.id} cell={cell} />;
        })}
      </>
    );
    if (pinPos === "start") {
      return (
        <skin.PinnedCols position="left" type={"body"}>
          {base}
        </skin.PinnedCols>
      );
    }
    if (pinPos === "end") {
      return (
        <skin.PinnedCols position="right" type={"body"}>
          {base}
        </skin.PinnedCols>
      );
    }
    return base;
  },
);
