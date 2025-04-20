import { flexRender } from "@tanstack/react-table";
import React from "react";
import { useMeasureCellContext } from "../../measure_cell_context";
import { createTablePropsSelector } from "../../utils";
import { VirtualHeaderCellProvider } from "../providers/virtual_header_cell_provider";
import { useTableContext } from "../table_context";
import { ShouldUpdate } from "../types";

const headerDefSelector = createTablePropsSelector(
  ({
    groupIndex,
    headerIndex,
    type,
    getShouldUpdateFn,
  }: {
    groupIndex: number;
    headerIndex: number;
    type: "header" | "footer";
    getShouldUpdateFn?: () => ShouldUpdate["header"] | undefined;
  }) => ({
    selector: (props) => {
      const headerGroups =
        type === "header" ? props.virtualData.header : props.virtualData.footer;
      const header = headerGroups.headerLookup[groupIndex][headerIndex];

      const headerInstance = header.header;
      return headerInstance;
    },
    shouldUnmount: (table) => {
      return (
        table.virtualData[type]?.headerLookup[groupIndex]?.[headerIndex] ===
        undefined
      );
    },
    callback: (headerInstance) => {
      return {
        headerDef: headerInstance.column.columnDef[type],
        headerContext: headerInstance.getContext(),
        isPlaceholder: headerInstance.isPlaceholder,
        headerId: headerInstance.id,
      };
    },
    dependencies: [{ type: "ui_props" }, { type: "tanstack_table" }],
    areCallbackOutputEqual: (prev, next) => {
      const shouldUpdateFn = getShouldUpdateFn?.();
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
  }),
);

export const TableHeaderCell = React.memo(function TableHeaderCell({
  type,
  groupIndex,
  headerIndex,
}: {
  type: "header" | "footer";
  groupIndex: number;
  headerIndex: number;
}) {
  const measuring = useMeasureCellContext();
  const { skin } = useTableContext();

  const { tableRef } = useTableContext();

  const { headerDef, headerContext, isPlaceholder, headerId } =
    headerDefSelector.useTableProps({
      groupIndex,
      headerIndex,
      type,
      getShouldUpdateFn: () => tableRef.current.uiProps.shouldUpdate?.header,
    });

  const content = React.useMemo(() => {
    return isPlaceholder ? null : flexRender(headerDef, headerContext);
  }, [headerDef, headerContext, isPlaceholder]);

  if (measuring) {
    measuring.registerCell(headerId);
  }

  return (
    <VirtualHeaderCellProvider
      type={type}
      groupIndex={groupIndex}
      headerIndex={headerIndex}
    >
      <skin.HeaderCell
        isMeasureInstance={Boolean(measuring)}
        ref={
          measuring
            ? (ref) => {
                const getHeader = () =>
                  tableRef.current.virtualData.header.headerLookup[groupIndex][
                    headerIndex
                  ].header;
                const header = getHeader();
                measuring.storeRef(ref, {
                  type: "header",
                  id: header.id,
                  columnId: header.column.id,
                  header: getHeader,
                });
              }
            : undefined
        }
      >
        {content}
      </skin.HeaderCell>
    </VirtualHeaderCellProvider>
  );
});
