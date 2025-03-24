import React from "react";

export const RowRefContext =
  React.createContext<React.RefObject<HTMLDivElement | null> | null>(null);
