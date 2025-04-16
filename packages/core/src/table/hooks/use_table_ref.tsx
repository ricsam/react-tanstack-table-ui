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
    const listenerEntry: any = {
      callback: listener,
      dependency: { type: "table" },
    };
    context.updateListeners.table.add(listenerEntry);
    return () => {
      context.updateListeners.table.delete(listenerEntry);
    };
  }, [context]);

  return tableRef;
};
