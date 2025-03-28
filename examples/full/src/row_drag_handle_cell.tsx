/*
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
*/

export const RowDragHandleCell = ({
  rowId,
  rowIndex,
  table,
}: {
  rowId: string;
  rowIndex: number;
  table: any;
}) => {
  // Using the rowId for aria-label to make it accessible
  return (
    <div
      aria-label={`Drag handle for row ${rowId}`}
      data-row-index={rowIndex}
      data-table-id={table.id}
      style={{
        cursor: "grab",
        padding: "4px",
        backgroundColor: "#f0f0f0",
        borderRadius: "4px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      ≡
    </div>
  );
};
