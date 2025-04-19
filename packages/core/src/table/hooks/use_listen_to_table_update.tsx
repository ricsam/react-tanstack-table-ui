import React from "react";
import {
  UpdateListenerEntries,
  UpdateType,
} from "../contexts/table_props_context";
import { RttuiTable } from "../types";
import { useTablePropsContext } from "./use_table_props_context";
export const useListenToTableUpdate = (
  callback: (table: RttuiTable, updateType: UpdateType) => void,
) => {
  const context = useTablePropsContext();
  const callbackRef = React.useRef(callback);
  callbackRef.current = callback;
  React.useEffect(() => {
    const listenerEntry: UpdateListenerEntries["*"] = {
      callback: (table, updateType) => {
        callbackRef.current(table, updateType);
      },
      dependency: { type: "*" },
    };
    context.updateListeners["*"].add(listenerEntry);
    return () => {
      context.updateListeners["*"].delete(listenerEntry);
    };
  }, [context]);
};
