import { Table } from "@tanstack/react-table";
import React from "react";
import { useTablePropsContext } from "./use_table_props_context";

export const useTableRef = () => {
  const context = useTablePropsContext();

  const tableRef = React.useRef(context.initialTable());
  React.useEffect(() => {
    const listener = (table: Table<any>) => {
      tableRef.current = table;
    };
    context.updateListeners.table.add(listener);
    return () => {
      context.updateListeners.table.delete(listener);
    };
  }, [context]);

  return tableRef;
};
