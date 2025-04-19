import React from "react";
import { TableCell } from "../cols/table_cell";
import { useTableProps } from "../hooks/use_table_props";
import { VirtualRowProvider } from "../providers/virtual_row_provider";
import { useTableContext } from "../table_context";
import { shallowEqual, useDebugDeps } from "../../utils";

export const TableRow = React.memo(function TableRow({
  rowIndex,
}: {
  rowIndex: number;
}) {
  const { skin } = useTableContext();
  const rowRef = React.useRef<HTMLDivElement>(null);

  const {
    isExpanded,
    subComponent,
    rowVirtualizer,
    relativeIndex,
    pinColsRelativeTo,
  } = useTableProps({
    areCallbackOutputEqual: shallowEqual,
    dependencies: [{ type: "tanstack_table" }, { type: "ui_props" }],
    callback: (props) => {
      const row = props.virtualData.body.rowLookup[rowIndex];
      const tanstackRow = row.row;

      const renderSubComponent = props.uiProps.renderSubComponent;

      const subRowsLength = tanstackRow.subRows.length;
      const rowIsExpanded = tanstackRow.getIsExpanded();
      let subComponent: React.ReactNode | undefined;
      let isExpanded: boolean = Boolean(
        subRowsLength === 0 && rowIsExpanded && renderSubComponent,
      );

      if (isExpanded && renderSubComponent) {
        subComponent = renderSubComponent(tanstackRow);
        if (subComponent) {
          isExpanded = true;
        }
      }

      return {
        isExpanded,
        subComponent,
        rowVirtualizer: props.virtualData.body.virtualizer,
        relativeIndex: row.relativeIndex,
        pinColsRelativeTo: props.uiProps.pinColsRelativeTo,
      };
    },
  });

  const { offsetLeft, offsetRight } = useTableProps({
    areCallbackOutputEqual: shallowEqual,
    selector: (props) => props.virtualData.body,
    callback: ({ offsetLeft, offsetRight }) => {
      return {
        offsetLeft,
        offsetRight,
      };
    },
    dependencies: [
      {
        type: "col_offsets_main",
      },
    ],
  });

  return (
    <>
      <VirtualRowProvider rowIndex={rowIndex}>
        <skin.TableRowWrapper
          relativeIndex={relativeIndex}
          ref={(el) => {
            rowRef.current = el;
            if (isExpanded) {
              rowVirtualizer.measureElement(el);
            }
          }}
        >
          <skin.TableRow relativeIndex={relativeIndex}>
            <ColSlice rowIndex={rowIndex} position="left" />
            <div
              style={{
                minWidth: offsetLeft,
                flexShrink: 0,
              }}
            ></div>
            <ColSlice rowIndex={rowIndex} position="center" />
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
            <ColSlice rowIndex={rowIndex} position="right" />
          </skin.TableRow>
          {isExpanded && (
            <skin.TableRowExpandedContent>
              {subComponent}
            </skin.TableRowExpandedContent>
          )}
        </skin.TableRowWrapper>
      </VirtualRowProvider>
    </>
  );
});

const ColSlice = React.memo(function ColSlice({
  rowIndex,
  position,
}: {
  rowIndex: number;
  position: "left" | "right" | "center";
}) {
  const { skin } = useTableContext();
  const cells = useTableProps({
    areCallbackOutputEqual: shallowEqual,
    callback: (props) => {
      const cells = props.virtualData.body.rowLookup[rowIndex][position].map(
        (cell) => cell.columnIndex,
      );
      return cells;
    },
    dependencies: [
      { type: "tanstack_table" },
      { type: "col_visible_range_main" },
    ],
  });

  if (cells.length === 0) {
    return null;
  }

  const base = (
    <>
      {cells.map((colIndex) => {
        return (
          <TableCell
            key={colIndex}
            columnIndex={colIndex}
            rowIndex={rowIndex}
          />
        );
      })}
    </>
  );
  if (position === "left") {
    return (
      <skin.PinnedCols position="left" type={"body"}>
        {base}
      </skin.PinnedCols>
    );
  }
  if (position === "right") {
    return (
      <skin.PinnedCols position="right" type={"body"}>
        {base}
      </skin.PinnedCols>
    );
  }
  return base;
});
