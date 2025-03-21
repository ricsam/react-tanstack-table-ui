import { ColumnOrderState, Table } from "@tanstack/react-table";
import React from "react";
import { VirtualHeaderGroup } from "./header_group";

export const useColDrag = (props: {
  columnOrder: ColumnOrderState;
  updateColumnOrder: (newColumnOrder: ColumnOrderState) => void;
  table: Table<any>;
  rowHeight: number;
  width: number;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const { table, tableContainerRef } = props;

  const [isColDragging, setIsColDragging] = React.useState<{
    colId: string;
    headerId: string;
    headerGroupIndex: number;
    type: "header" | "footer";
  } | null>(null);

  // const vhead = useHeaderGroupVirtualizers({
  //   headerGroups: table.getHeaderGroups(),
  //   tableContainerRef,
  //   table,
  //   type: "header",
  //   rowHeight: props.rowHeight,
  // });
  // const vfoot = useHeaderGroupVirtualizers({
  //   headerGroups: table.getFooterGroups(),
  //   tableContainerRef,
  //   table,
  //   type: "footer",
  //   rowHeight: props.rowHeight,
  // });

  const headerGroups: VirtualHeaderGroup[] = [];
  const footerGroups: VirtualHeaderGroup[] = [];

  return { isColDragging, setIsColDragging, headerGroups, footerGroups };
};
