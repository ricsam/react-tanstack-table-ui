import { HeaderGroup } from "@tanstack/react-table";
import React from "react";
import { ColVirtualizerContext } from "../contexts/ColVirtualizerContext";
import { CombinedHeaderGroup, VirtualHeaderGroup } from "../types";
import { useHeaderGroupVirtualizers } from "./use_header_group_virtualizers";
import { useTableRef } from "../hooks/useTableRef";
const combinedHeaderGroups = (
  getGroups: () => HeaderGroup<any>[][],
): CombinedHeaderGroup[] => {
  const numGroups = Math.max(...getGroups().map((group) => group.length));
  const combinedGroups: CombinedHeaderGroup[] = [];
  for (let i = 0; i < numGroups; i++) {
    combinedGroups[i] = {
      id: getGroups()
        .map((group) => group[i].id)
        .join(""),
      headers: () => {
        return getGroups().flatMap((group) => {
          return group[i].headers;
        });
      },
      headerGroups: () => {
        return getGroups().flatMap((group) => {
          return group[i];
        });
      },
    };
  }
  return combinedGroups;
};
export const ColVirtualizerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const tableRef = useTableRef();

  const headerGroups: VirtualHeaderGroup[] = useHeaderGroupVirtualizers({
    headerGroups: combinedHeaderGroups(() => [
      tableRef.current.getLeftHeaderGroups(),
      tableRef.current.getCenterHeaderGroups(),
      tableRef.current.getRightHeaderGroups(),
    ]),
    type: "header",
  });
  const footerGroups: VirtualHeaderGroup[] = useHeaderGroupVirtualizers({
    headerGroups: combinedHeaderGroups(() => [
      tableRef.current.getLeftFooterGroups(),
      tableRef.current.getCenterFooterGroups(),
      tableRef.current.getRightFooterGroups(),
    ]),
    type: "footer",
  });

  const mainHeaderGroup: VirtualHeaderGroup | undefined =
    headerGroups[headerGroups.length - 1] ?? footerGroups[0];

  // const firstRow = table.getRowModel().rows[0].getVisibleCells();
  // const bodyVirtualizer = useVirtualizer({
  //   count: firstRow.length,
  //   getScrollElement: () => tableContainerRef.current,
  //   estimateSize: (index) => firstRow[index].column.getSize(),
  //   getItemKey(index) {
  //     return (
  //       mainHeaderGroup?.headerGroup.headers[index].id ??
  //       firstRow[index].column.id
  //     );
  //   },
  //   horizontal: true,
  // });

  if (!mainHeaderGroup) {
    throw new Error("Implement me using the body virtualizer");
  }
  // console.log("headerGroups", headerGroups, mainHeaderGroup);

  return (
    <ColVirtualizerContext.Provider
      value={React.useMemo(() => {
        return {
          onDragStart: () => {},
          setIsDragging: () => {},
          headerGroups,
          footerGroups,
          mainHeaderGroup,
        };
      }, [headerGroups, footerGroups, mainHeaderGroup])}
    >
      {children}
    </ColVirtualizerContext.Provider>
  );
};
