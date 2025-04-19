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

    let refObject: React.RefObject<RttuiTable> | null = null;

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
    };

    const triggerUpdate = (
      dependencies: Dependency[],
      updateType: UpdateType,
    ) => {
      const tbl = refObject?.current;

      if (!tbl) {
        throw new Error("table is not set");
      }
      if (DEBUG_TRIGGER_ALL) {
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
              if (dependency.groupType !== listener.dependency.groupType) {
                return;
              }
              if (dependency.groupIndex !== listener.dependency.groupIndex) {
                return;
              }
            }
            if (dependency.type !== listener.dependency.type) {
              return;
            }

            listener.callback(tbl, updateType);
          });
        });
        if (!dependencies.find((d) => d.type === "*")) {
          updateListeners["*"].forEach((listener) => {
            listener.callback(tbl, updateType);
          });
        }
      }
    };
    return {
      updateTable: (action: Action) => {
        if (action.type === "initial") {
          refObject = action.ref;
        }
      },
      triggerUpdate,
      updateListeners,
      initialTable: () => {
        if (!refObject || !refObject.current) {
          throw new Error("initialTable is not set");
        }
        return refObject.current;
      },
    };
  });

  return (
    <TablePropsContext.Provider value={contextValue}>
      {children}
    </TablePropsContext.Provider>
  );
};
