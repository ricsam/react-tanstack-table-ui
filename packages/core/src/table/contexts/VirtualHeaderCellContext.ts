import React from "react";
import { VirtualHeaderCell } from "../types";

export const VirtualHeaderCellContext = React.createContext<
  VirtualHeaderCell | undefined
>(undefined);
