import React from "react";
import { memoize, strictEqual } from "../../utils";
import {
  Dependency,
  UpdateListenerEntry,
  UpdateType,
} from "../contexts/table_props_context";
import { RttuiTable } from "../types";
import { useMeasureContext } from "./use_measure_context";
import { useTablePropsContext } from "./use_table_props_context";

export type UseTablePropsOptions<T, U> = {
  areCallbackOutputEqual?: (prevProps: T, newProps: T) => boolean;
  dependencies?: Dependency[];
  selector?: (table: RttuiTable) => U;
  callback: (table: U) => T;
};

export const useTableProps = <T, U = RttuiTable>({
  areCallbackOutputEqual = strictEqual,
  dependencies = [{ type: "*" }],
  selector,
  callback,
}: UseTablePropsOptions<T, U>): T => {
  const callbacks = { callback, areCallbackOutputEqual, selector };
  const callbackRefs = React.useRef(callbacks);
  callbackRefs.current = callbacks;

  const memoCallback = React.useMemo(() => {
    const fn = memoize(
      (
        /**
         * essentially U
         */
        table: any,
      ): T => callbackRefs.current.callback(table),
    );
    const selector = callbackRefs.current.selector
      ? memoize(callbackRefs.current.selector)
      : undefined;
    return (table: RttuiTable) => {
      return fn(selector ? selector(table) : table);
    };
  }, []);
  const context = useTablePropsContext();
  const prevVal = React.useRef<T | undefined>(undefined);
  let latest: T | undefined;
  try {
    latest = memoCallback(context.initialTable());
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

  const value = React.useRef<T>(latest);
  const lastCommittedValue = React.useRef<T>(latest);

  const [rerenderCount, setRerenderCount] = React.useState(0);
  const rerenderCountRef = React.useRef(rerenderCount);
  rerenderCountRef.current = rerenderCount;

  const memoCallbackRef = React.useRef(memoCallback);
  memoCallbackRef.current = memoCallback;

  React.useEffect(() => {
    const listener =
      (_dependency: Dependency) =>
      (table: RttuiTable, updateType: UpdateType) => {
        let hadIssue = false;
        try {
          const result = memoCallbackRef.current(table);
          const areEqual = callbackRefs.current.areCallbackOutputEqual(
            value.current,
            result,
          );
          if (!areEqual) {
            value.current = result;
          }
        } catch (e) {
          // ignore
          hadIssue = true;
        }
        const rerender = () => {
          setRerenderCount(rerenderCountRef.current + 1);
        };
        if (lastCommittedValue.current !== value.current) {
          if (updateType.type === "from_layout_effect") {
            rerender();
          } else if (updateType.type === "from_dom_event") {
            // if (updateType.sync) {
            //   flushSync(rerender);
            // } else {
            // rerender();
            // }
            rerender();
          }
        }
      };
    const teardown: (() => void)[] = [];
    dependencies.forEach((dependency) => {
      const listenerArtifact: UpdateListenerEntry = {
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
    result = memoCallback(context.initialTable());
  } catch (e) {
    // ignore, probably during unmount
    // return the previous value
    if (prevVal.current) {
      result = prevVal.current;
    } else {
      throw e;
    }
  }
  const areEqual = areCallbackOutputEqual(value.current, result);
  if (!areEqual) {
    value.current = result;
  }

  lastCommittedValue.current = value.current;

  // const measureContext = useMeasureContext();
  // if (!measureContext.consumerOnMeasureCb && !measureContext.isMeasuring) {
  //   console.trace("useTableProps");
  // }

  return value.current;
};
