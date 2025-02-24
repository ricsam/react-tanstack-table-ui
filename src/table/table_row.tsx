import { Cell, Row } from "@tanstack/react-table";
import React, { CSSProperties } from "react";
import { VirtualItem } from "../react-virtual";
import { useDrag } from "./use_drag";
import { DndRowContext } from "./dnd_provider";
import { getFlatIndex } from "./utils";
import { getColVirtualizedOffsets } from "./get_col_virtualized_offset";
import { DragAlongCell } from "./drag_along_cell";

export const TableRow = React.memo(function TableRow({
  row,
  virtualColumns,
  measureElement,
  width,
  totalSize,
  rowHeight,
}: {
  row: Row<any>;
  virtualColumns: VirtualItem[];
  measureElement: (el?: HTMLElement | null) => void;
  width: number;
  totalSize: number;
  rowHeight: number;
}) {
  const visibileCells = row.getVisibleCells();

  const { transform, transition, setNodeRef, isDragging, hidden } = useDrag(
    DndRowContext,
    row.id,
    getFlatIndex(row),
  );

  // console.log("@transform?.y ?? 0", transform?.y ?? 0);

  const style: CSSProperties = {
    // position: "absolute",
    // transform: `translate3d(calc(var(--virtual-padding-left, 0) * 1px), ${virtualRow.start}px, 0)`,
    // transform: `translate3d(0, ${virtualOffsetTop}px, 0)`,
    // transform: transform
    //   ? CSS.Transform.toString(transform)
    //   : `translate3d(0, ${virtualOffsetTop}px, 0)`,
    transform: `translate3d(0, ${transform?.y ?? 0}px, 0)`,
    // top: virtualOffsetTop,
    position: "relative",
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    width,
    backgroundColor: "black",
    display: hidden ? "none" : "block",
  };
  // if (hidden) {
  //   console.log("hidden");
  // }

  // let lastPinned: undefined | number;
  // let firstNonPinned: undefined | number;
  // for (let i = 0; i < virtualColumns.length; i++) {
  //   const vc = virtualColumns[i];
  //   const header = visibileCells[vc.index];
  //   if (header.column.getIsPinned()) {
  //     lastPinned = i;
  //   } else {
  //     firstNonPinned = i;
  //     break;
  //   }
  // }

  // let offsetLeft = 0;

  // if (typeof firstNonPinned !== "undefined") {
  //   offsetLeft = virtualColumns[firstNonPinned].start;
  //   if (typeof lastPinned !== "undefined") {
  //     offsetLeft -= virtualColumns[lastPinned].end;
  //   }
  // }

  const { offsetLeft, offsetRight } = getColVirtualizedOffsets({
    virtualColumns,
    getIsPinned(vcIndex) {
      const header = visibileCells[vcIndex];
      return !!header.column.getIsPinned();
    },
    totalSize,
  });

  const loop = (predicate: (header: Cell<any, unknown>) => boolean) => {
    return (
      <>
        {virtualColumns
          .map((virtualColumn) => ({
            cell: visibileCells[virtualColumn.index],
            start: virtualColumn.start,
          }))
          .filter(({ cell }) => predicate(cell))
          .map(({ cell, start }) => {
            return (
              <DragAlongCell
                key={cell.id}
                cell={cell}
                start={start}
                offsetLeft={offsetLeft}
                rowHeight={rowHeight}
              />
            );
          })}
      </>
    );
  };

  const isExpanded = row.subRows.length === 0 && row.getIsExpanded();

  return (
    <>
      <div
        style={{
          ...style,
        }}
        data-index={getFlatIndex(row)}
        ref={(el) => {
          setNodeRef(el);
          if (isExpanded) {
            console.log("measureElement", row.id, getFlatIndex(row));
            measureElement(el);
          }
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            width,
            height: rowHeight,
          }}
        >
          {loop((cell) => cell.column.getIsPinned() === "left")}
          <div style={{ width: offsetLeft }}></div>
          {loop((cell) => cell.column.getIsPinned() === false)}
          <div style={{ width: offsetRight }}></div>
          {loop((cell) => cell.column.getIsPinned() === "right")}
        </div>
        {isExpanded && <div>{renderSubComponent({ row })}</div>}
      </div>
    </>
  );
});

const renderSubComponent = ({ row }: { row: Row<any> }) => {
  return (
    <pre style={{ fontSize: "10px", textAlign: "left" }}>
      <code>{JSON.stringify(row.original, null, 2)}</code>
    </pre>
  );
};
