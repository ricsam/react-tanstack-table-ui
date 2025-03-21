import { useRowContext } from "./rows/row_context";
import { TableRow, VirtualRow } from "./rows/table_row";
import { useTableContext } from "./table_context";

export const TableBody = ({
  rows,
  offsetBottom,
  offsetTop,
}: {
  rows: VirtualRow[];
  offsetTop: number;
  offsetBottom: number;
}) => {
  const { table, rowHeight } = useTableContext();
  const { headerGroups, footerGroups } = useRowContext();

  const loop = (rows: VirtualRow[]) => {
    return (
      <>
        {rows.map((virtualRow) => {
          return <TableRow key={virtualRow.row.id} {...virtualRow} />;
        })}
      </>
    );
  };

  const pinnedTop = rows.filter((row) => row.isPinned === "start");

  return (
    <div
      className="tbody"
      style={{
        position: "relative",
        width: table.getTotalSize(),
      }}
    >
      <div
        style={{
          position: "sticky",
          zIndex: 1,
          top: headerGroups.length * rowHeight,
        }}
      >
        {loop(pinnedTop)}
      </div>
      <div style={{ height: offsetTop }} className="offset-top"></div>
      {loop(rows.filter((row) => row.isPinned === false))}
      <div style={{ height: offsetBottom }} className="offset-bottom"></div>
      <div
        style={{
          position: "sticky",
          zIndex: 1,
          bottom: footerGroups.length * rowHeight - 1,
        }}
      >
        {loop(rows.filter((row) => row.isPinned === "end"))}
      </div>
    </div>
  );
};
