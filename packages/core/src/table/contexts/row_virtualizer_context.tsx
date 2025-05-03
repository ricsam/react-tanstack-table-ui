"use client";
import React from "react";
import { RowVirtualizerContextType } from "../rows/row_virtualizer_context_type";

export const RowVirtualizerContext = React.createContext<
  RowVirtualizerContextType | undefined
>(undefined);
