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
