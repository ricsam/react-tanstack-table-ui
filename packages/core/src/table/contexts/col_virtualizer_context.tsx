import React from "react";
import { ColVirtualizerType } from "../cols/col_virtualizer_type";

export const ColVirtualizerContext = React.createContext<
  ColVirtualizerType | undefined
>(undefined);
