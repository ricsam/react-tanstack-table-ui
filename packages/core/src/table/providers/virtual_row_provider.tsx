import React from "react";
import { VirtualRowContext } from "../contexts/virtual_row_context";
import { useTableRef } from "../hooks/use_table_ref";

export const VirtualRowProvider = ({
  rowIndex,
  children,
}: {
  rowIndex: number;
  children: React.ReactNode;
}) => {
  const tableRef = useTableRef();
  return (
    <VirtualRowContext.Provider
      value={React.useCallback(() => {
        const row = tableRef.current?.virtualData.body.rowLookup[rowIndex];
        return row;
      }, [tableRef, rowIndex])}
    >
      {children}
    </VirtualRowContext.Provider>
  );
};
