import React from "react";
import { useTablePropsContext } from "../hooks/use_table_props_context";
import { Dependency } from "../contexts/table_props_context";

export const useTriggerTablePropsUpdate = (
  dependency: Dependency,
  cacheKey?: string,
) => {
  const { triggerUpdate } = useTablePropsContext();
  const cacheKeyRef = React.useRef(cacheKey);
  const cacheKeyChanged = cacheKeyRef.current !== cacheKey;
  cacheKeyRef.current = cacheKey;

  const shouldUpdate = cacheKeyChanged || typeof cacheKey !== "string";

  const shouldUpdateInEffectRef = React.useRef(shouldUpdate);

  if (shouldUpdate) {
    triggerUpdate(dependency, false);
    shouldUpdateInEffectRef.current = shouldUpdate;
  }

  React.useLayoutEffect(() => {
    const shouldUpdate = shouldUpdateInEffectRef.current;
    if (shouldUpdate) {
      triggerUpdate(dependency, true);
      shouldUpdateInEffectRef.current = false;
    }
  });
};
