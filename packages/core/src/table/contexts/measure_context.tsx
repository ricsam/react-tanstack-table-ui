import { createContext } from "react";
import { MeasureData } from "../types";

export type IsMeasuring = {
  callback: (measureData: MeasureData) => void;
  horizontalScrollOffset: number;
  verticalScrollOffset: number;
  horizontalOverscan: number;
  verticalOverscan: number;
};

export type MeasureContextType = {
  measureCells: (isMeasuring: IsMeasuring) => void;
  isMeasuring: IsMeasuring | undefined;
  width: number;
  height: number;
  isMeasuringInstanceLoading: boolean;
};

export const MeasureContext = createContext<MeasureContextType | undefined>(
  undefined,
);
