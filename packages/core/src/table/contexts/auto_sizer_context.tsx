"use client";
import { createContext } from "react";

export type AutoSizerContextType = {
  width?: number;
  height?: number;
};
export const AutoSizerContext = createContext<AutoSizerContextType | undefined>(
  undefined,
);
