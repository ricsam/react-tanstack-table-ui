import React from "react";

export const RowContext = React.createContext<
  undefined | { getStart: (id: string) => number }
>(undefined);
