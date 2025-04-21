import React from "react";
import { VirtualHeaderCellContext } from "../contexts/virtual_header_cell_context";
import { useTableContext } from "../table_context";
import { RttuiHeader } from "../types";

export const VirtualHeaderCellProvider = ({
  type,
  groupIndex,
  headerIndex,
  children,
}: {
  type: "header" | "footer";
  groupIndex: number;
  headerIndex: number;
  children: React.ReactNode;
}) => {
  const { tableRef } = useTableContext();
  return (
    <VirtualHeaderCellContext.Provider
      value={React.useMemo(() => {
        return (): RttuiHeader | undefined => {
          const headerGroups =
            type === "header"
              ? tableRef.current.virtualData.header
              : tableRef.current.virtualData.footer;
          return headerGroups.headerLookup?.[groupIndex]?.[headerIndex];
        };
      }, [groupIndex, headerIndex, tableRef, type])}
    >
      {children}
    </VirtualHeaderCellContext.Provider>
  );
};
