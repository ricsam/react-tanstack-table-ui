import { Table } from "@tanstack/react-table";
import { useDrag } from "./use_drag";
import { DndRowContext } from "./dnd_provider";

export const RowDragHandleCell = ({
  rowId,
  rowIndex,
  table,
}: {
  rowId: string;
  rowIndex: number;
  table: Table<any>;
}) => {
  const { attributes, listeners, hidden } = useDrag(
    DndRowContext,
    rowId,
    rowIndex,
  );
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
