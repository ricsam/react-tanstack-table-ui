"use client";
import { createContext } from "react";

export type NotifyPayload =
  | { type: "innerSize"; size: { width: number; height: number } }
  | { type: "fixedSize"; size: { width?: number; height?: number } };

export type AutoSizerContextType = {
  width?: number;
  height?: number;
  wrapperRef?: React.RefObject<HTMLDivElement | null>;
  notify: (payload: NotifyPayload) => void;
  initialWidth?: number;
  initialHeight?: number;
};
export const AutoSizerContext = createContext<AutoSizerContextType | undefined>(
  undefined,
);
