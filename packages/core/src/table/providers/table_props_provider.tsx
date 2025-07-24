import React from "react";
import {
  Action,
  Dependency,
  GetDependency,
  TablePropsContext,
  TablePropsContextType,
  UpdateListenersExact,
  UpdateType,
} from "../contexts/table_props_context";
import { RttuiTable } from "../types";

const DEBUG_TRIGGER_ALL = false;

export const TablePropsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [contextValue] = React.useState((): TablePropsContextType => {
    const getSet = <T extends Dependency["type"]>(
      _: T,
    ): Set<{
      callback: (table: RttuiTable, updateType: UpdateType) => void;
      dependency: GetDependency<T>;
    }> => new Set();

    let tableRef: React.RefObject<RttuiTable | undefined> | undefined;

    const updateListeners: UpdateListenersExact = {
      "*": getSet("*"),
      tanstack_table: getSet("tanstack_table"),
      ui_props: getSet("ui_props"),
      row_offsets: getSet("row_offsets"),
      col_offsets: getSet("col_offsets"),

      col_offsets_main: getSet("col_offsets_main"),
      col_visible_range_main: getSet("col_visible_range_main"),

      col_visible_range: getSet("col_visible_range"),
      row_visible_range: getSet("row_visible_range"),
      is_scrolling: getSet("is_scrolling"),
      is_resizing_column: getSet("is_resizing_column"),
    };

    const getTable = () => {
      if (!tableRef) {
        throw new Error("tableRef is not set");
      }
      const value = tableRef.current;
      if (!value) {
        throw new Error("tableRef is not set");
      }
      return value;
    };

    const triggerUpdate = (
      dependencies: Dependency[],
      updateType: UpdateType,
    ) => {
      if (updateType.type === "from_render_method") {
        return;
      }
      const tbl = getTable();

      if (!tbl) {
        throw new Error("table is not set");
      }
      if (DEBUG_TRIGGER_ALL || updateType.initial) {
        Object.values(updateListeners).forEach((listeners) => {
          listeners.forEach((listener) => {
            listener.callback(tbl, updateType);
          });
        });
      } else {
        dependencies.forEach((dependency) => {
          updateListeners[dependency.type].forEach((listener) => {
            if (
              (dependency.type === "col_offsets" &&
                listener.dependency.type === "col_offsets") ||
              (dependency.type === "col_visible_range" &&
                listener.dependency.type === "col_visible_range")
            ) {
              if (
                dependency.groupType &&
                listener.dependency.groupType &&
                dependency.groupType !== listener.dependency.groupType
              ) {
                return;
              }
              if (
                typeof dependency.groupIndex === "number" &&
                typeof listener.dependency.groupIndex === "number" &&
                dependency.groupIndex !== listener.dependency.groupIndex
              ) {
                return;
              }
            }

            if (
              dependency.type === "is_scrolling" &&
              listener.dependency.type === "is_scrolling"
            ) {
              if (
                dependency.direction &&
                listener.dependency.direction &&
                dependency.direction !== listener.dependency.direction
              ) {
                return;
              }
            }

            if (
              dependency.type === "is_resizing_column" &&
              listener.dependency.type === "is_resizing_column"
            ) {
              if (
                typeof dependency.columnId === "string" &&
                typeof listener.dependency.columnId === "string" &&
                dependency.columnId !== listener.dependency.columnId
              ) {
                return;
              }
            }

            if (dependency.type !== listener.dependency.type) {
              return;
            }

            listener.callback(tbl, updateType);
          });
        });
      }
    };
    return {
      setInitialTableGetters: (action: Action) => {
        if (action.type === "initial") {
          tableRef = action.tableRef;
        }
      },
      triggerUpdate,
      updateListeners,
    };
  });

  return (
    <TablePropsContext.Provider value={contextValue}>
      {children}
    </TablePropsContext.Provider>
  );
};
