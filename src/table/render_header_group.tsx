import { Header, HeaderGroup, Table } from "@tanstack/react-table";
import { getColVirtualizedOffsets } from "./cols/get_col_virtualized_offset";
import { DraggableTableHeader } from "./draggable_table_header";
import { VirtualItem, Virtualizer } from "../lib/react-virtual";

export function renderHeaderGroup({
  headerGroup,
  virtualColumns,
  virtualizer,
  hidden,
  table,
  defToRender,
  rowHeight,
  canDrag: groupCanDrag,
  draggedColId,
}: {
  headerGroup: HeaderGroup<any>;
  virtualColumns: VirtualItem[];
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  hidden: boolean;
  table: Table<any>;
  defToRender: "footer" | "header";
  rowHeight: number;
  canDrag: boolean;
  draggedColId: string | null;
}) {
  const { offsetLeft, offsetRight } = getColVirtualizedOffsets({
    virtualColumns,
    getIsPinned(vcIndex) {
      const header = headerGroup.headers[vcIndex];
      return !!header.column.getIsPinned();
    },
    totalSize: virtualizer.getTotalSize(),
  });

  const loop = (predicate: (header: Header<any, unknown>) => boolean) => {
    if (hidden) {
      return null;
    }
    const draggableHeader = (
      <>
        {virtualColumns
          .map((vc) => ({
            header: headerGroup.headers[vc.index],
            start: vc.start,
            colIndex: vc.index,
          }))
          .filter(({ header }) => predicate(header))
          .map(({ header, start, colIndex }) => {
            let canDrag = true;
            if (header.isPlaceholder) {
              canDrag = false;
            }

            if (!groupCanDrag) {
              canDrag = false;
            }
            return (
              <DraggableTableHeader
                key={header.id}
                canDrag={canDrag}
                hidden={Boolean(
                  draggedColId && draggedColId !== header.column.id,
                )}
                header={header}
                table={table}
                colIndex={colIndex}
                start={start}
                offsetLeft={offsetLeft}
                defToRender={defToRender}
              />
            );
          })}
      </>
    );

    return draggableHeader;

    // return (
    //   <>
    //     {!canDrag ? (
    //       <>
    //         {virtualColumns
    //           .map((vc) => ({
    //             header: headerGroup.headers[vc.index],
    //             start: vc.start,
    //           }))
    //           .filter(({ header }) => predicate(header))
    //           .map(({ header, start }) => {
    //             return (
    //               <DisplayHeader
    //                 key={header.id}
    //                 header={header}
    //                 defToRender={defToRender}
    //               />
    //             );
    //           })}
    //       </>
    //     ) : (
    //       draggableHeader
    //     )}
    //   </>
    // );
  };

  return (
    <div
      key={headerGroup.id}
      style={{
        display: "flex",
        height: rowHeight,
      }}
    >
      {loop((header) => header.column.getIsPinned() === "left")}
      <div style={{ width: offsetLeft }}></div>
      {loop((header) => header.column.getIsPinned() === false)}
      <div style={{ width: offsetRight }}></div>
      {loop((header) => header.column.getIsPinned() === "right")}
    </div>
  );
}
