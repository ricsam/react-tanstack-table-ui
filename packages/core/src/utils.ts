import { ColumnPinningPosition, Header } from "@tanstack/react-table";
import React from "react";
import { useTableProps } from "./table/hooks/use_table_props";
import { RttuiTable } from "./table/types";
import { UseTablePropsOptions } from "./table/hooks/use_table_props";

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
export const getLeafHeaders = (header: Header<any, unknown>) => {
  const leafHeaders: Header<any, unknown>[] = [];
  const appendLeafHeaders = (header: Header<any, unknown>) => {
    if (header.subHeaders.length > 0) {
      header.subHeaders.forEach(appendLeafHeaders);
    } else {
      leafHeaders.push(header);
    }
  };
  appendLeafHeaders(header);
  return leafHeaders;
};

export const getIsPinned = (header: Header<any, unknown>) => {
  // for pinned, let the subheaders decide how it should be pinned
  const subHeaders = getLeafHeaders(header);
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

export function strictEqual(a: any, b: any) {
  return a === b;
}

export function memoize<T, U>(fn: (arg: U) => T) {
  let cache: T;
  let prevArg: any;
  return (arg: U): T => {
    if (prevArg === arg) return cache;
    prevArg = arg;
    cache = fn(arg);
    return cache;
  };
}

export const createTablePropsSelector = <
  D extends unknown[],
  T,
  U = RttuiTable,
>(
  callback: (...props: D) => UseTablePropsOptions<T, U>,
) => {
  return {
    useTableProps: (...props: D) => {
      return useTableProps(callback(...props));
    },
  };
};
