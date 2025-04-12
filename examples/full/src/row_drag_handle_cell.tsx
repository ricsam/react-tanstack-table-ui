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
