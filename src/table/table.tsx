import { ColumnOrderState, Table } from "@tanstack/react-table";
import React from "react";
import { useColContext } from "./cols/col_context";
import { HeaderGroup } from "./cols/header_group";
import { useRowContext } from "./rows/row_context";
import { RowProvider } from "./rows/row_provider";
import { TableBody } from "./table_body";
import { TableContext, useTableContext } from "./table_context";
import { ColProvider } from "./cols/col_provider";

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

  return (
    <TableContext.Provider
      value={{
        rowHeight: props.rowHeight,
        width: props.width,
        height: props.height,
        tableContainerRef: tableContainerRef,
        table,
      }}
    >
      <ColProvider>
        <RowProvider>
          <Body
            tableContainerRef={tableContainerRef}
            width={props.width}
            height={props.height}
          />
        </RowProvider>
      </ColProvider>
    </TableContext.Provider>
  );
};

function Body({
  tableContainerRef,
  width,
  height,
}: {
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  width: number;
  height: number;
}) {
  const { table, rowHeight } = useTableContext();
  const { rowVirtualizer, rows, offsetBottom, offsetTop } = useRowContext();
  const { footerGroups, headerGroups } = useColContext();

  return (
    <div
      ref={tableContainerRef}
      style={{
        overflow: "auto",
        width: width + "px",
        height: height + "px",
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
            rowVirtualizer.getTotalSize() +
            footerGroups.length * rowHeight +
            headerGroups.length * rowHeight,
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
        {headerGroups.map((headerGroup) => {
          return <HeaderGroup {...headerGroup} key={headerGroup.id} />;
        })}
      </div>

      <TableBody
        rows={rows}
        offsetBottom={offsetBottom}
        offsetTop={offsetTop}
      ></TableBody>

      <div
        className="table-footer"
        style={{
          position: "sticky",
          bottom: -1,
          background: "black",
          width: table.getTotalSize(),
          zIndex: 1,
        }}
      >
        {footerGroups.map((footerGroup) => {
          return <HeaderGroup {...footerGroup} key={footerGroup.id} />;
        })}
      </div>
    </div>
  );
}
