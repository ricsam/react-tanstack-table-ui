import { Table } from "@tanstack/react-table";
import { useDrag } from "./use_drag";
import { DndRowContext } from "./dnd_provider";
import { useContext } from "react";
import { RowContext } from "./row_context";

export const RowDragHandleCell = ({
  rowId,
  rowIndex,
  table,
}: {
  rowId: string;
  rowIndex: number;
  table: Table<any>;
}) => {
  const getStart = useContext(RowContext)?.getStart;
  if (!getStart) {
    throw new Error("no row context found!");
  }

  const start = getStart(rowId);

  const { attributes, listeners, hidden } = useDrag({
    AnoDndContext: DndRowContext,
    id: rowId,
    thisIndex: rowIndex,
    start,
  });

  return (
    // Alternatively, you could set these attributes on the rows themselves
    <button
      {...attributes}
      {...listeners}
      style={{ display: hidden ? "none" : "inline", userSelect: "none" }}
    >
      🟰
    </button>
  );
};
