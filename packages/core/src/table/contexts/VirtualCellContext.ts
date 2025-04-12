import React from "react";
import { VirtualCell } from "../types";

export const VirtualCellContext = React.createContext<VirtualCell | undefined>(
  undefined,
);
