import { Table } from "@tanstack/react-table";
import React from "react";
import { useTablePropsContext } from "./use_table_props_context";

export const useListenToTableUpdate = (
  callback: (table: Table<any>) => void,
) => {
  const context = useTablePropsContext();
  const callbackRef = React.useRef(callback);
  callbackRef.current = callback;
  React.useEffect(() => {
    const listener = (table: Table<any>) => {
      callbackRef.current(table);
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
};
