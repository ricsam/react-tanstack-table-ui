import React from "react";
import { useTablePropsContext } from "../hooks/use_table_props_context";
import { Dependency } from "../contexts/table_props_context";

export type TriggerUpdateDep = {
  dependency: Dependency;
  cacheKey?: string;
};

export const useTriggerTablePropsUpdate = (deps: TriggerUpdateDep[]) => {
  const { triggerUpdate } = useTablePropsContext();
  const depsRef = React.useRef(deps);

  const shouldUpdate = deps.filter(
    (d, index) =>
      typeof d.cacheKey === "undefined" ||
      d.cacheKey !== depsRef.current[index]?.cacheKey,
  );

  depsRef.current = deps;

  const shouldUpdateInEffectRef = React.useRef<false | typeof shouldUpdate>(
    false,
  );

  if (shouldUpdate.length > 0) {
    shouldUpdate.forEach((dep) => {
      triggerUpdate(dep.dependency, false);
    });
    shouldUpdateInEffectRef.current = shouldUpdate;
  }

  React.useLayoutEffect(() => {
    const shouldUpdate = shouldUpdateInEffectRef.current;
    if (shouldUpdate) {
      shouldUpdate.forEach((dep) => {
        triggerUpdate(dep.dependency, true);
      });
      shouldUpdateInEffectRef.current = false;
    }
  });
};
