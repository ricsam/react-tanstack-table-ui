import { ColumnPinningPosition, Header } from "@tanstack/react-table";
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
const getSubHeaders = (header: Header<any, unknown>) => {
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
