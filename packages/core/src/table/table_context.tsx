import React from "react";
import { RttuiTable } from "./types";
import { Skin } from "../skin";

export type TableContextType = {
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  skin: Skin;
  loading: boolean;
  tableRef: React.RefObject<RttuiTable>;
};

export const TableContext = React.createContext<TableContextType | undefined>(
  undefined,
);

export const useTableContext = () => {
  const context = React.useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used within a TableProvider");
  }
  return context;
};
