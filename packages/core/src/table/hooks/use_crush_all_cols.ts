import React from "react";
import { useMeasureContext } from "./use_measure_context";

export const useCrushAllCols = () => {
  const { crushAllColumns } = useMeasureContext();
  const crushAllColumnsRef = React.useRef(crushAllColumns);
  crushAllColumnsRef.current = crushAllColumns;
  return React.useCallback(() => {
    crushAllColumnsRef.current();
  }, []);
};
