import React from "react";
import { ColVirtualizerContext } from "../contexts/ColVirtualizerContext";

export const useColVirtualizer = () => {
  const context = React.useContext(ColVirtualizerContext);
  if (!context) {
    throw new Error("useColContext must be used within a ColProvider");
  }
  return context;
};
