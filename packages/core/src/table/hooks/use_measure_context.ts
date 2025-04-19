import {
  MeasureContext,
  MeasureContextType,
} from "../contexts/measure_context";

import { useContext } from "react";

export const useMeasureContext = (): MeasureContextType => {
  const context = useContext(MeasureContext);
  if (!context) {
    throw new Error("MeasureContext not found");
  }
  return context;
};
