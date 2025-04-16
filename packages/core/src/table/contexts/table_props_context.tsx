import { Table } from "@tanstack/react-table";
import { createContext } from "react";

export type Dependency =
  | "table"
  | "row_offsets"
  | `col_offsets`
  | `col_visible_range_${"header" | "footer" | "main"}`
  | "row_visible_range";

export type UpdateListeners = {
  [key in Dependency]: Set<(table: Table<any>, rerender: boolean) => void>;
};

export type TablePropsContextType = {
  // tableUpdateListeners: Set<(table: Table<any>, rerender: boolean) => void>;
  updateTable: (table: Table<any>, rerender: boolean) => void;
  initialTable: () => Table<any>;
  updateListeners: UpdateListeners;
  triggerUpdate: (dependency: Dependency, rerender: boolean) => void;
};

export const TablePropsContext = createContext<
  TablePropsContextType | undefined
>(undefined);
