import React from "react";
import { useMeasureContext } from "./use_measure_context";
import { CrushBy } from "../types";

export const useCrushAllCols = () => {
  const { crushAllColumns } = useMeasureContext();
  const crushAllColumnsRef = React.useRef(crushAllColumns);
  crushAllColumnsRef.current = crushAllColumns;
  return React.useCallback((crushBy: CrushBy | "default" = "default") => {
    crushAllColumnsRef.current(crushBy);
  }, []);
};
