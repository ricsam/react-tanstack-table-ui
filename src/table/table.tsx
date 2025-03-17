import { ColumnOrderState, Table } from "@tanstack/react-table";
import { ColDragProvider } from "./cols/col_drag_provider";
import { renderHeaderGroup } from "./render_header_group";
import { RowDragProvider } from "./rows/row_drag_provider";
import { TableBody } from "./table_body";
import React from "react";
import { useRowDrag } from "./rows/use_row_drag";
import { useColDrag } from "./cols/use_col_drag";

export const VirtualizedTable = <T,>(props: {
  data: T[];
  updateData: (newData: T[]) => void;
  columnOrder: ColumnOrderState;
  updateColumnOrder: (newColumnOrder: ColumnOrderState) => void;
  table: Table<T>;
  getSubRows: (row: T) => T[];
  updateSubRows: (row: T, newSubRows: T[]) => T;
  getId: (row: T) => string;
  getGroup: (row: T) => string | undefined;
  rootGroup: string;
  rowHeight: number;
  width: number;
  height: number;
}) => {
  const { table } = props;
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);

  const { rowVirtualizer, draggedRowId, setDraggedRowId, rows, rowIds } =
    useRowDrag({ ...props, tableContainerRef });

  const { vhead, vfoot, isColDragging, setIsColDragging } = useColDrag({
    ...props,
    tableContainerRef,
  });

  const getBodyVirtualCols = () => {
    return vhead.getVirtualHeaders(vhead.headerGroups.length - 1);
  };

  const virtualRows = rowVirtualizer.getVirtualItems();

  const bodyCols = getBodyVirtualCols().virtualColumns;

  return (
    <ColDragProvider
      columnOrder={props.columnOrder}
      table={table}
      rowHeight={props.rowHeight}
      width={props.width}
      updateColumnOrder={props.updateColumnOrder}
      tableContainerRef={tableContainerRef}
      vfoot={vfoot}
      vhead={vhead}
      isColDragging={isColDragging}
      setIsColDragging={setIsColDragging}
    >
      <RowDragProvider
        data={props.data}
        updateData={props.updateData}
        updateSubRows={props.updateSubRows}
        table={table}
        getSubRows={props.getSubRows}
        getId={props.getId}
        getGroup={props.getGroup}
        rootGroup={props.rootGroup}
        rowHeight={props.rowHeight}
        height={props.height}
        tableContainerRef={tableContainerRef}
        rowVirtualizer={rowVirtualizer}
        draggedRowId={draggedRowId}
        setDraggedRowId={setDraggedRowId}
        rows={rows}
        rowIds={rowIds}
      >
        <div
          ref={tableContainerRef}
          style={{
            overflow: "auto",
            width: props.width + "px",
            height: props.height + "px",
            position: "relative",
            contain: "paint",
            willChange: "transform",
          }}
        >
          <div
            className="table-scroller"
            style={{
              width: table.getTotalSize(),
              height:
                rowVirtualizer.getTotalSize() + vhead.height + vfoot.height,
              position: "absolute",
            }}
          ></div>

          <div
            className="thead"
            style={{
              position: "sticky",
              top: 0,
              background: "black",
              width: table.getTotalSize(),
              zIndex: 1,
            }}
          >
            {vhead.headerGroups.map((headerGroup, headerGroupIndex, arr) => {
              const { virtualColumns, virtualizer } =
                vhead.getVirtualHeaders(headerGroupIndex);

              // if we are splitting the header group, we need to disable the parent headers, i.e. not render them
              const hidden =
                isColDragging &&
                (isColDragging.headerGroupIndex > headerGroupIndex ||
                  isColDragging.type !== "header")
                  ? true
                  : false;

              // headerGroup.id ===

              return renderHeaderGroup({
                headerGroup,
                virtualColumns,
                virtualizer,
                hidden,
                table,
                defToRender: "header",
                rowHeight: props.rowHeight,
                canDrag: headerGroupIndex === arr.length - 1,
                draggedColId:
                  isColDragging && headerGroupIndex !== arr.length - 1
                    ? isColDragging.colId
                    : null,
              });
            })}
          </div>

          <TableBody
            virtualColumns={bodyCols}
            virtualRows={virtualRows}
            rows={rows}
            measureElement={rowVirtualizer.measureElement}
            width={table.getTotalSize()}
            totalWidth={table.getTotalSize()}
            totalHeight={rowVirtualizer.getTotalSize()}
            rowHeight={props.rowHeight}
            rowIds={rowIds}
          ></TableBody>

          <div
            className="table-footer"
            style={{
              position: "sticky",
              bottom: 0,
              background: "black",
              width: table.getTotalSize(),
              zIndex: 1,
            }}
          >
            {vfoot.headerGroups.map((footerGroup, footerIndex, arr) => {
              const { virtualColumns, virtualizer } =
                vfoot.getVirtualHeaders(footerIndex);

              // if we are splitting the header group, we need to disable the parent headers, i.e. not render them
              const hidden =
                isColDragging &&
                (isColDragging.headerGroupIndex < footerIndex ||
                  isColDragging.type !== "footer")
                  ? true
                  : false;

              return renderHeaderGroup({
                headerGroup: footerGroup,
                virtualColumns,
                virtualizer,
                hidden,
                table,
                canDrag: footerIndex === 0,
                defToRender: "footer",
                rowHeight: props.rowHeight,
                draggedColId:
                  isColDragging && footerIndex !== 0
                    ? isColDragging.colId
                    : null,
              });
            })}
          </div>
        </div>
      </RowDragProvider>
    </ColDragProvider>
  );
};
