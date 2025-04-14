import { Table } from "@tanstack/react-table";
import React from "react";
import { shallowEqual } from "../../utils";
import { useTablePropsContext } from "./use_table_props_context";

export const useTableProps = <T,>(
  callback: (table: Table<any>) => T,
  arePropsEqual: (prevProps: T, newProps: T) => boolean = shallowEqual,
): T => {
  const context = useTablePropsContext();
  const latest = callback(context.initialTable());
  const [, triggerRerender] = React.useReducer(() => ({}), {});

  const value = React.useRef<T>(latest);
  const lastCommittedValue = React.useRef<T>(latest);

  const callbacks = { callback, arePropsEqual };
  const callbackRefs = React.useRef(callbacks);
  callbackRefs.current = callbacks;
  React.useEffect(() => {
    const listener = (table: Table<any>, rerender: boolean) => {
      const result = callbackRefs.current.callback(table);
      const areEqual = callbackRefs.current.arePropsEqual(
        value.current,
        result,
      );
      if (!areEqual) {
        value.current = result;
      }
      if (rerender && lastCommittedValue.current !== value.current) {
        triggerRerender();
      }
    };
    context.tableUpdateListeners.add(listener);
    return () => {
      context.tableUpdateListeners.delete(listener);
    };
  }, [context.tableUpdateListeners]);

  lastCommittedValue.current = value.current;

  return value.current;
};
