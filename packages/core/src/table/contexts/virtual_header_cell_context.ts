import React from "react";
import { RttuiHeader } from "../types";

export const VirtualHeaderCellContext = React.createContext<
  (() => RttuiHeader | undefined) | undefined
>(undefined);
