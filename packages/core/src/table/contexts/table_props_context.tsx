import { Table } from "@tanstack/react-table";
import { createContext } from "react";

export type Dependency =
  | { type: "table" }
  | { type: "row_offsets" }
  | { type: "col_visible_range_main" }
  | { type: "col_offsets_main" }
  | { type: "col_offsets"; groupType?: "header" | "footer"; groupId?: string }
  | {
      type: "col_visible_range";
      groupType?: "header" | "footer";
      groupId?: string;
    }
  | { type: "row_visible_range" };

export type GetDependency<
  T extends Dependency["type"],
  U extends Dependency = Dependency,
> = {
  [key in Dependency["type"]]: U extends { type: T } ? U : never;
}[T];

export type UpdateListeners = {
  [key in Dependency["type"]]: Set<{
    callback: (table: Table<any>, rerender: boolean) => void;
    dependency: GetDependency<key>;
  }>;
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
