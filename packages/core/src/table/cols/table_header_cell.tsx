import { flexRender } from "@tanstack/react-table";
import React from "react";
import { useMeasureCellContext } from "../../measure_cell_context";
import { useTableProps } from "../hooks/useTableProps";
import { VirtualHeaderCellContext } from "../contexts/VirtualHeaderCellContext";
import { useTableContext } from "../table_context";
import { VirtualHeaderCell } from "../types";

export const TableHeaderCell = React.memo(function TableHeaderCell({
  header,
}: {
  header: VirtualHeaderCell;
}) {
  const measuring = useMeasureCellContext();
  const { skin, refs } = useTableContext();
  if (measuring) {
    measuring.registerCell(header.id);
  }

  const { headerDef, headerContext, isPlaceholder } = useTableProps(
    () => {
      const headerInstance = header.header();

      return {
        headerDef: headerInstance.column.columnDef[header.type],
        headerContext: headerInstance.getContext(),
        isPlaceholder: headerInstance.isPlaceholder,
      };
    },
    (prev, next) => {
      const shouldUpdateFn = refs.current.shouldUpdate?.header;
      if (shouldUpdateFn) {
        const arePropsEqual = shouldUpdateFn(
          prev.headerContext,
          next.headerContext,
        )
          ? false
          : true;
        return arePropsEqual;
      }

      // shallow equal will not work because the objects will always be different
      // so we always return false to always re-render and if the user wants
      // better performance they can return true in the shouldUpdate function
      return false;
    },
  );

  const content = React.useMemo(() => {
    return isPlaceholder ? null : flexRender(headerDef, headerContext);
  }, [headerDef, headerContext, isPlaceholder]);

  return (
    <VirtualHeaderCellContext.Provider value={header} key={header.id}>
      <skin.HeaderCell
        {...header}
        isMeasuring={Boolean(measuring)}
        ref={
          measuring
            ? (ref) => {
                measuring.storeRef(ref, {
                  type: "header",
                  id: header.id,
                  columnId: header.columnId,
                  header: header.header,
                });
              }
            : undefined
        }
      >
        {content}
      </skin.HeaderCell>
    </VirtualHeaderCellContext.Provider>
  );
});
