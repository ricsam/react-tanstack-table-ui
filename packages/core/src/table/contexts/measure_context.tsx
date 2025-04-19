import { createContext } from "react";
import { MeasureData } from "../types";

export type MeasureContextType = {
  measureCells: (cb: (measureData: MeasureData) => void) => void;
  consumerOnMeasureCb: ((measureData: MeasureData) => void) | undefined;
  width: number;
  height: number;
  isMeasuring: boolean;
};

export const MeasureContext = createContext<MeasureContextType | undefined>(
  undefined,
);
