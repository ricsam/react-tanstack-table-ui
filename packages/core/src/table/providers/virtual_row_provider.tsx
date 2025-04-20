import React from "react";
import { VirtualRowContext } from "../contexts/virtual_row_context";
import { useTableContext } from "../table_context";

export const VirtualRowProvider = ({
  rowIndex,
  children,
}: {
  rowIndex: number;
  children: React.ReactNode;
}) => {
  const { tableRef } = useTableContext();
  return (
    <VirtualRowContext.Provider
      value={React.useCallback(() => {
        const row = tableRef.current.virtualData.body.rowLookup[rowIndex];
        return row;
      }, [tableRef, rowIndex])}
    >
      {children}
    </VirtualRowContext.Provider>
  );
};
