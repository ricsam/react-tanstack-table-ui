import React from "react";
import { RttuiTable } from "../types";
import { useTablePropsContext } from "./use_table_props_context";
import { UpdateListenerEntry } from "../contexts/table_props_context";
export const useTableRef = () => {
  const context = useTablePropsContext();

  const tableRef = React.useRef(context.initialTable());
  React.useEffect(() => {
    const listener = (table: RttuiTable) => {
      tableRef.current = table;
    };
    const listenerEntry: UpdateListenerEntry = {
      callback: listener,
      dependency: { type: "*" },
    };
    context.updateListeners["*"].add(listenerEntry);
    return () => {
      context.updateListeners["*"].delete(listenerEntry);
    };
  }, [context]);

  return tableRef;
};
