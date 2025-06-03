"use client";
import { ColumnDefTemplate, HeaderContext } from "@tanstack/react-table";
import React from "react";
import { Skin } from "../skin";
import { RttuiTable } from "./types";

export type TableContextType = {
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  skin: Skin;
  loading: boolean;
  tableRef: React.RefObject<RttuiTable>;
  renderHeaderPlaceholder: (
    headerDef: undefined | ColumnDefTemplate<HeaderContext<any, any>>,
    headerContext: HeaderContext<any, any>,
  ) => React.ReactNode;
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
