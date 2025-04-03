import { Row } from "@tanstack/react-table";
import React from "react";

export const RowContext = React.createContext<
  | undefined
  | {
      row: Row<any>;
    }
>(undefined);

export const useRow = () => {
  const context = React.useContext(RowContext);
  if (!context) {
    throw new Error("useRow must be used within a RowContext.Provider");
  }
  return context;
};
