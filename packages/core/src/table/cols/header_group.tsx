import React from "react";
import { useTableContext } from "../table_context";
import { TableHeaderCell } from "./table_header_cell";
import { VirtualHeaderCell } from "./virtual_header/types";
export type VirtualHeaderGroup = {
  offsetLeft: number;
  offsetRight: number;
  headers: VirtualHeaderCell[];
  id: string;
};

export const HeaderGroup = React.memo(function HeaderGroup({
  offsetLeft,
  offsetRight,
  headers,
  type,
}: VirtualHeaderGroup & {
  type: "header" | "footer";
}) {
  const loop = (headers: VirtualHeaderCell[]) => {
    const draggableHeader = (
      <>
        {headers.map((header) => {
          return <TableHeaderCell key={header.headerId} header={header} />;
        })}
      </>
    );

    return draggableHeader;
  };

  const pinnedLeft = headers.filter((header) => header.isPinned === "start");
  const pinnedRight = headers.filter((header) => header.isPinned === "end");
  const { skin, pinColsRelativeTo } = useTableContext();

  return (
    <skin.HeaderRow type={type}>
      <skin.PinnedCols position="left" pinned={pinnedLeft} type={type}>
        {loop(pinnedLeft)}
      </skin.PinnedCols>
      <div style={{ width: offsetLeft, flexShrink: 0 }}></div>
      {loop(headers.filter((header) => header.isPinned === false))}
      <div
        style={
          pinColsRelativeTo === "table"
            ? {
                minWidth: offsetRight,
                flexShrink: 0,
                flexGrow: 1,
              }
            : {
                width: offsetRight,
                flexShrink: 0,
              }
        }
      ></div>
      <skin.PinnedCols position="right" pinned={pinnedRight} type={type}>
        {loop(pinnedRight)}
      </skin.PinnedCols>
    </skin.HeaderRow>
  );
});
