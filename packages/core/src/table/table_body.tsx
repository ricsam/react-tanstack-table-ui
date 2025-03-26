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
  const { skin } = useTableContext();

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
  const pinnedBottom = rows.filter((row) => row.isPinned === "end");
  return (
    <skin.TableBody>
      <skin.PinnedRows position="top" pinned={pinnedTop}>{loop(pinnedTop)}</skin.PinnedRows>

      <div style={{ height: offsetTop }} className="offset-top"></div>

      {loop(rows.filter((row) => row.isPinned === false))}

      <div style={{ height: offsetBottom }} className="offset-bottom"></div>

      <skin.PinnedRows position="bottom" pinned={pinnedBottom}>{loop(pinnedBottom)}</skin.PinnedRows>
    </skin.TableBody>
  );
};
