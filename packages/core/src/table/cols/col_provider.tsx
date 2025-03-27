import React from "react";
import { useTableContext } from "../table_context";
import { ColContext } from "./col_context";
import { VirtualHeaderGroup } from "./header_group";
import { useHeaderGroupVirtualizers } from "./use_header_group_virtualizers";

export const ColProvider = ({ children }: { children: React.ReactNode }) => {
  const { table } = useTableContext();

  const headerGroups: VirtualHeaderGroup[] = useHeaderGroupVirtualizers({
    headerGroups: table.getHeaderGroups(),
    type: "header",
  });
  const footerGroups: VirtualHeaderGroup[] = useHeaderGroupVirtualizers({
    headerGroups: table.getFooterGroups(),
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

  return (
    <ColContext.Provider
      value={React.useMemo(
        () => {
          return ({
            onDragStart: () => { },
            setIsDragging: () => { },
            headerGroups,
            footerGroups,
            mainHeaderGroup,
          });
        },
        [headerGroups, footerGroups, mainHeaderGroup],
      )}
    >
      {children}
    </ColContext.Provider>
  );
};
