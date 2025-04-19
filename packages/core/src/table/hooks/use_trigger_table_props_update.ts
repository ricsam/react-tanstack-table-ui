import React from "react";
import { Dependency } from "../contexts/table_props_context";
import { useTablePropsContext } from "../hooks/use_table_props_context";

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
    triggerUpdate(
      shouldUpdate.map((d) => d.dependency),
      {
        type: "from_render_method",
      },
    );
    shouldUpdateInEffectRef.current = shouldUpdate;
  }

  React.useLayoutEffect(() => {
    const shouldUpdate = shouldUpdateInEffectRef.current;
    if (shouldUpdate) {
      triggerUpdate(
        shouldUpdate.map((d) => d.dependency),
        {
          type: "from_layout_effect",
        },
      );
      shouldUpdateInEffectRef.current = false;
    }
  });
};
