import { AutoSizerContext } from "../contexts/auto_sizer_context";
import { useContext } from "react";

export const useAutoSizer = () => {
  const autoSizerContext = useContext(AutoSizerContext);
  if (!autoSizerContext) {
    throw new Error("AutoSizerContext not found");
  }
  return autoSizerContext;
};
