"use client";
import { createContext } from "react";
import { RttuiTable } from "../types";

export type Dependency =
  | { type: "*" }
  | { type: "tanstack_table" }
  | { type: "ui_props" }
  | { type: "row_offsets" }
  | { type: "col_visible_range_main" }
  | { type: "col_offsets_main" }
  | { type: "is_scrolling"; direction?: "horizontal" | "vertical" }
  | { type: "is_resizing_column"; columnId?: string }
  | {
      type: "col_offsets";
      groupType?: "header" | "footer";
      groupIndex?: number;
    }
  | {
      type: "col_visible_range";
      groupType?: "header" | "footer";
      groupIndex?: number;
    }
  | { type: "row_visible_range" };

export type GetDependency<
  T extends Dependency["type"],
  U extends Dependency = Dependency,
> = {
  [key in Dependency["type"]]: U extends { type: T } ? U : never;
}[T];

export type UpdateListenerEntry = {
  callback: (table: RttuiTable, updateType: UpdateType) => void;
  dependency: Dependency;
};

type UpdateListenerEntries = {
  [key in Dependency["type"]]: {
    callback: UpdateListenerEntry["callback"];
    dependency: GetDependency<key>;
  };
};

export type UpdateListenersExact = {
  [key in Dependency["type"]]: Set<UpdateListenerEntries[key]>;
};
type UpdateListenersGeneric = {
  [key in Dependency["type"]]: Set<UpdateListenerEntry>;
};

export type UpdateType =
  | {
      type: "from_dom_event";
      sync: boolean;
      initial: boolean;
    }
  | {
      type: "from_render_method";
      initial: boolean;
    }
  | {
      type: "from_layout_effect";
      initial: boolean;
    };

export type TablePropsContextType = {
  updateListeners: UpdateListenersGeneric;
  setInitialTableGetters: (action: Action) => void;
  triggerUpdate: (dependencies: Dependency[], updateType: UpdateType) => void;
};

export const TablePropsContext = createContext<
  TablePropsContextType | undefined
>(undefined);

export type Action = {
  type: "initial";
  tableRef: React.RefObject<RttuiTable | undefined>;
};
