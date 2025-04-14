import { ColumnPinningPosition, Header, Table } from "@tanstack/react-table";
import React from "react";

export function tuple<A, B, C, D>(a: A, b: B, c: C, d: D): [A, B, C, D];
export function tuple<A, B, C>(a: A, b: B, c: C): [A, B, C];
export function tuple<A, B>(a: A, b: B): [A, B];
export function tuple(...args: any[]) {
  return args;
}

const initial = Symbol();
export const useDebugDeps = (...deps: unknown[]) => {
  const previousDeps = React.useRef<unknown[]>(deps.map(() => initial));
  const diffingDeps: unknown[] = [];
  deps.forEach((dep, index) => {
    const prev = previousDeps.current[index];
    if (prev === initial) {
      diffingDeps.push(tuple("initial_render", index, dep));
    } else if (prev !== dep) {
      diffingDeps.push(tuple(index, prev, dep));
    }
  });
  previousDeps.current = deps;
  return diffingDeps;
};

let prevLog: any = null;
export const logDiff = (...values: any[]) => {
  if (prevLog === values.join(", ")) {
    return;
  }
  prevLog = values.join(", ");
  console.log(...values);
};

export const mapColumnPinningPositionToPinPos = (
  pos: ColumnPinningPosition,
) => {
  if (pos === false) {
    return false;
  }
  if (pos === "left") {
    return "start";
  }
  return "end";
};
export const getSubHeaders = (header: Header<any, unknown>) => {
  const subHeaders: Header<any, unknown>[] = [];
  const appendSubHeaders = (header: Header<any, unknown>) => {
    if (header.subHeaders.length > 0) {
      header.subHeaders.forEach(appendSubHeaders);
    } else {
      subHeaders.push(header);
    }
  };
  appendSubHeaders(header);
  return subHeaders;
};

export const getIsPinned = (header: Header<any, unknown>) => {
  // for pinned, let the subheaders decide how it should be pinned
  const subHeaders = getSubHeaders(header);
  const allVals = subHeaders.map((h) => h.column.getIsPinned());
  const uniqueVals = [...new Set(allVals)];
  return uniqueVals[uniqueVals.length - 1] ?? false;
};

/**
 * Identifies which keys are different between two objects.
 * Useful for debugging why a shallow equality check failed.
 *
 * @param objA First object to compare
 * @param objB Second object to compare
 * @param excludeKeys Optional keys to exclude from comparison
 * @returns Array of keys that are different between the objects
 */
export function findDifferentKeys(
  objA: any,
  objB: any,
  excludeKeys?: string | string[],
): string[] {
  if (objA === objB) return [];
  if (!objA || !objB || typeof objA !== "object" || typeof objB !== "object")
    return ["<objects_not_comparable>", objA, objB];

  // Convert single key to array for consistent handling
  const excludeKeysArr = excludeKeys
    ? Array.isArray(excludeKeys)
      ? excludeKeys
      : [excludeKeys]
    : [];

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  const differentKeys: string[] = [];

  // Check for keys in A that are different from B
  for (const key of keysA) {
    if (excludeKeysArr.includes(key)) continue;

    if (!keysB.includes(key)) {
      differentKeys.push(`${key} (missing in second object)`);
    } else if (objA[key] !== objB[key]) {
      differentKeys.push(
        `${key} (values differ: ${objA[key]} vs ${objB[key]})`,
      );
    }
  }

  // Check for keys in B that don't exist in A
  for (const key of keysB) {
    if (excludeKeysArr.includes(key)) continue;

    if (!keysA.includes(key)) {
      differentKeys.push(`${key} (missing in first object)`);
    }
  }

  return differentKeys;
}

// Helper for shallow equality on objects (for dndStyle)
export function shallowEqual(
  objA: any,
  objB: any,
  excludeKeys?: string | string[],
): boolean {
  if (objA === objB) return true; // same reference
  if (typeof objA !== typeof objB) return false; // different types
  if (typeof objA !== "object" && objA !== objB) return false; // primitive values that are not the same

  // these are objects
  if (!objA && !objB) return true; // both null
  if ((!objA && objB) || (objA && !objB)) return false; // is one null and the other not?
  if (Object.keys(objA).length !== Object.keys(objB).length) return false; // different number of keys

  // Convert single key to array for consistent handling
  const excludeKeysArr = excludeKeys
    ? Array.isArray(excludeKeys)
      ? excludeKeys
      : [excludeKeys]
    : [];

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  // Filter out excluded keys for length comparison
  const filteredKeysA = keysA.filter((key) => !excludeKeysArr.includes(key));
  const filteredKeysB = keysB.filter((key) => !excludeKeysArr.includes(key));

  if (filteredKeysA.length !== filteredKeysB.length) return false;

  // Only compare non-excluded keys
  for (const key of filteredKeysA) {
    if (objA[key] !== objB[key]) return false;
  }

  return true;
}

const tableUpdateListeners = new Set<
  (table: Table<any>, rerender: boolean) => void
>();
let initialTable: Table<any> | null = null;
export const triggerTableUpdate = (table: Table<any>, rerender: boolean) => {
  initialTable = table;
  tableUpdateListeners.forEach((listener) => {
    try {
      listener(table, rerender);
    } catch (err) {
      // ignore errors
    }
  });
};
export const useTableProps = <T>(
  callback: (table: Table<any>) => T,
  arePropsEqual: (prevProps: T, newProps: T) => boolean = shallowEqual,
): T => {
  if (!initialTable) {
    throw new Error(
      "This hook must be used within ReactTanstackTableUi, not outside of it.",
    );
  }
  const latest = callback(initialTable);
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
    tableUpdateListeners.add(listener);
    return () => {
      tableUpdateListeners.delete(listener);
    };
  }, []);

  lastCommittedValue.current = value.current;

  return value.current;
};
export const useTableRef = () => {
  if (!initialTable) {
    throw new Error(
      "This hook must be used within ReactTanstackTableUi, not outside of it.",
    );
  }
  const tableRef = React.useRef(initialTable);
  React.useEffect(() => {
    const listener = (table: Table<any>) => {
      tableRef.current = table;
    };
    tableUpdateListeners.add(listener);
    return () => {
      tableUpdateListeners.delete(listener);
    };
  }, []);

  return tableRef;
};

export const useListenToTableUpdate = (
  callback: (table: Table<any>) => void,
) => {
  const callbackRef = React.useRef(callback);
  callbackRef.current = callback;
  React.useEffect(() => {
    const listener = (table: Table<any>) => {
      callbackRef.current(table);
    };
    tableUpdateListeners.add(listener);
    return () => {
      tableUpdateListeners.delete(listener);
    };
  }, []);
};
