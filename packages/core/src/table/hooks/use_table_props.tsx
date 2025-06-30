"use client";
import React from "react";
import { strictEqual } from "../../utils";
import {
  Dependency,
  UpdateListenerEntry,
  UpdateType,
} from "../contexts/table_props_context";
import { RttuiTable } from "../types";
import { useTablePropsContext } from "./use_table_props_context";
import { useTableContext } from "../table_context";
import { flushSync } from "react-dom";

export type UseTablePropsOptions<T, U> = {
  areCallbackOutputEqual?: (prevProps: T, newProps: T) => boolean;
  dependencies?: Dependency[];
  selector?: (table: RttuiTable) => U;
  callback: (table: U) => T;
  shouldUnmount?: (table: RttuiTable) => boolean;
};

export const useTableProps = <T, U = RttuiTable>({
  areCallbackOutputEqual = strictEqual,
  dependencies = [],
  selector,
  callback,
  shouldUnmount,
}: UseTablePropsOptions<T, U>): T => {
  const callbacks = {
    callback,
    areCallbackOutputEqual,
    selector,
    shouldUnmount,
  };

  const callbackRefs = React.useRef(callbacks);
  callbackRefs.current = callbacks;

  const memoCallback = React.useMemo(() => {
    const fn = (table: any) => callbackRefs.current.callback(table);

    const selector = callbackRefs.current.selector
      ? callbackRefs.current.selector
      : undefined;
    return (table: RttuiTable) => {
      return fn(selector ? selector(table) : table);
    };
  }, []);
  const context = useTablePropsContext();
  const tableContext = useTableContext();
  const prevVal = React.useRef<T | undefined>(undefined);
  let latest: T | undefined;
  if (!shouldUnmount || !shouldUnmount(tableContext.tableRef.current)) {
    latest = memoCallback(tableContext.tableRef.current);
  } else {
    // ignore, probably during unmount
    // return the previous value
    if (prevVal.current) {
      latest = prevVal.current;
    } else {
      throw new Error(
        "useTableProps: no previous value and shouldUnmount is true",
      );
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

  const willRender = React.useRef(false);
  value.current = latest;
  willRender.current = false;
  lastCommittedValue.current = value.current;

  React.useLayoutEffect(() => {
    const listener =
      (_dependency: Dependency) =>
      (table: RttuiTable, updateType: UpdateType) => {
        if (willRender.current) {
          return;
        }
        const shouldUnmount = callbackRefs.current.shouldUnmount;
        if (shouldUnmount?.(table)) {
          return;
        }
        const result = memoCallbackRef.current(table);
        const areEqual = callbackRefs.current.areCallbackOutputEqual(
          value.current,
          result,
        );
        if (!areEqual) {
          value.current = result;
        }
        const rerender = () => {
          willRender.current = true;
          setRerenderCount(rerenderCountRef.current + 1);
        };

        if (lastCommittedValue.current !== value.current) {
          if (updateType.type === "from_layout_effect") {
            rerender();
          } else if (updateType.type === "from_dom_event") {
            if (updateType.sync) {
              flushSync(rerender);
            } else {
              rerender();
            }
          }
        }
      };
    const teardown: (() => void)[] = [];
    const listenToDependency = (dependency: Dependency) => {
      const listenerArtifact: UpdateListenerEntry = {
        callback: listener(dependency),
        dependency,
      };
      context.updateListeners[dependency.type].add(listenerArtifact);
      teardown.push(() => {
        context.updateListeners[dependency.type].delete(listenerArtifact);
      });
    };
    dependencies.forEach(listenToDependency);
    // listenToDependency({ type: "*" });
    return () => {
      teardown.forEach((teardown) => {
        teardown();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.updateListeners, ...dependencies.sort()]);

  return value.current;
};

export function useListenToTableProps() {
  const context = useTablePropsContext();
  return {
    listenTo: React.useCallback((
      events: Dependency[],
      callback: (table: RttuiTable, updateType: UpdateType) => void | (() => void),
    ) => {
      const teardowns: (() => void)[] = [];
      events.forEach((event) => {
        const callbackCleanups: (() => void)[] = [];
        const listenerArtifact: UpdateListenerEntry = {
          callback: (table, updateType) => {
            callbackCleanups.forEach((cleanup) => {
              cleanup();
            });
            callbackCleanups.length = 0;
            const cleanup = callback(table, updateType);
            if (cleanup) {
              callbackCleanups.push(cleanup);
            }
          },
          dependency: event,
        };
        context.updateListeners[event.type].add(listenerArtifact);
        const teardown = () => {
          context.updateListeners[event.type].delete(listenerArtifact);
          callbackCleanups.forEach((cleanup) => {
            cleanup();
          });
          callbackCleanups.length = 0;
        };
        teardowns.push(teardown);
      });
      return () => {
        teardowns.forEach((teardown) => {
          teardown();
        });
      };
    }, [context.updateListeners]),
  };
}
