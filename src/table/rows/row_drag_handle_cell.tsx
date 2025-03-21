import React from "react";
import { useRowContext } from "./row_context";
import { RowRefContext } from "./row_ref_context";

export const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const ctx = useRowContext();
  const rowRef = React.useContext(RowRefContext);

  return (
    // Alternatively, you could set these attributes on the rows themselves
    <button
      onMouseDown={(ev: React.MouseEvent) => {
        const rect = rowRef?.current?.getBoundingClientRect();
        if (!rect) {
          throw new Error("No rect");
        }
        ctx.setIsDragging({
          rowId,
          mouseStart: { x: ev.clientX, y: ev.clientY },
          itemPos: {
            x: rect.left,
            y: rect.top,
          },
        });
      }}
      style={{ display: "inline", userSelect: "none" }}
    >
      🟰
    </button>
  );
};
