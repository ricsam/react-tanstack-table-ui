import { Table } from "@tanstack/react-table";
import React from "react";
import { shallowEqual } from "../../utils";
import { Dependency } from "../contexts/table_props_context";
import { useTablePropsContext } from "./use_table_props_context";

export type UseTablePropsOptions<T> = {
  arePropsEqual?: (prevProps: T, newProps: T) => boolean;
  dependencies?: Dependency[];
};

export const useTableProps = <T,>(
  callback: (table: Table<any>) => T,
  {
    arePropsEqual = shallowEqual,
    dependencies = [{ type: "table" }],
  }: UseTablePropsOptions<T> = {},
): T => {
  const context = useTablePropsContext();
  const prevVal = React.useRef<T | undefined>(undefined);
  let latest: T | undefined;
  try {
    latest = callback(context.initialTable());
  } catch (e) {
    // ignore, probably during unmount
    // return the previous value
    if (prevVal.current) {
      latest = prevVal.current;
    } else {
      throw e;
    }
  }
  prevVal.current = latest;
  const [renderCount, setRenderCount] = React.useState(0);

  const value = React.useRef<T>(latest);
  const lastCommittedValue = React.useRef<T>(latest);

  const callbacks = { callback, arePropsEqual };
  const callbackRefs = React.useRef(callbacks);
  callbackRefs.current = callbacks;
  const renderCountRef = React.useRef(renderCount);
  renderCountRef.current = renderCount;
  React.useEffect(() => {
    const listener = (_dependency: Dependency) => (table: Table<any>, rerender: boolean) => {
      const result = callbackRefs.current.callback(table);
      const areEqual = callbackRefs.current.arePropsEqual(
        value.current,
        result,
      );
      if (!areEqual) {
        value.current = result;
      }
      if (rerender && lastCommittedValue.current !== value.current) {
        // console.log('batching', renderCountRef.current, _dependency.type)
        setRenderCount(renderCountRef.current + 1); // batch updates together
      }
    };
    const teardown: (() => void)[] = [];
    dependencies.forEach((dependency) => {
      const listenerArtifact: any = {
        callback: listener(dependency),
        dependency,
      };
      context.updateListeners[dependency.type].add(listenerArtifact);
      teardown.push(() => {
        context.updateListeners[dependency.type].delete(listenerArtifact);
      });
    });
    return () => {
      teardown.forEach((teardown) => {
        teardown();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.updateListeners, ...dependencies.sort()]);

  let result: T;
  try {
    result = callback(context.initialTable());
  } catch (e) {
    // ignore, probably during unmount
    // return the previous value
    if (prevVal.current) {
      result = prevVal.current;
    } else {
      throw e;
    }
  }
  const areEqual = arePropsEqual(value.current, result);
  if (!areEqual) {
    value.current = result;
  }

  lastCommittedValue.current = value.current;

  return value.current;
};
