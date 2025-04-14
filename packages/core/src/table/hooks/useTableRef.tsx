import { Table } from "@tanstack/react-table";
import React from "react";
import { useTablePropsContext } from "./useTablePropsContext";

export const useTableRef = () => {
  const context = useTablePropsContext();

  const tableRef = React.useRef(context.initialTable());
  React.useEffect(() => {
    const listener = (table: Table<any>) => {
      tableRef.current = table;
    };
    context.tableUpdateListeners.add(listener);
    return () => {
      context.tableUpdateListeners.delete(listener);
    };
  }, [context]);

  return tableRef;
};
