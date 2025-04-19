import React from "react";
import { RttuiCell } from "../types";

export const VirtualCellContext = React.createContext<
  (() => RttuiCell) | undefined
>(undefined);
