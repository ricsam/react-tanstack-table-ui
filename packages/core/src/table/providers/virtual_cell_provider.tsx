import React from "react";
import { VirtualCellContext } from "../contexts/virtual_cell_context";
import { useTableContext } from "../table_context";

export const VirtualCellProvider = ({
  children,
  columnIndex,
  rowIndex,
}: {
  children: React.ReactNode;
  columnIndex: number;
  rowIndex: number;
}) => {
  const { tableRef } = useTableContext();
  return (
    <VirtualCellContext.Provider
      value={React.useCallback(() => {
        // console.count("VirtualCellProvider");
        return tableRef.current.virtualData.body.cellLookup?.[rowIndex]?.[
          columnIndex
        ];
      }, [tableRef, rowIndex, columnIndex])}
    >
      {children}
    </VirtualCellContext.Provider>
  );
};
