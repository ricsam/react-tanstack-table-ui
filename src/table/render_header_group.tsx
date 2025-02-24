import { Header, HeaderGroup, Table } from "@tanstack/react-table";
import { VirtualItem, Virtualizer } from "../react-virtual";
import { DisplayHeader } from "./display_header";
import { DraggableTableHeader } from "./draggable_table_header";
import { getColVirtualizedOffsets } from "./get_col_virtualized_offset";

export function renderHeaderGroup<T>({
  headerGroup,
  virtualColumns,
  virtualizer,
  isClosestToTable,
  isDragging,
  table,
  defToRender,
  rowHeight,
}: {
  headerGroup: HeaderGroup<T>;
  virtualColumns: VirtualItem[];
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  isClosestToTable: boolean;
  isDragging: boolean;
  table: Table<T>;
  defToRender: "footer" | "header";
  rowHeight: number;
}) {
  const { offsetLeft, offsetRight } = getColVirtualizedOffsets({
    virtualColumns,
    getIsPinned(vcIndex) {
      const header = headerGroup.headers[vcIndex];
      return !!header.column.getIsPinned();
    },
    totalSize: virtualizer.getTotalSize(),
  });

  const loop = (predicate: (header: Header<T, unknown>) => boolean) => {
    return (
      <>
        {!isClosestToTable ? (
          isDragging ? null : (
            <>
              {virtualColumns
                .map((vc) => ({
                  header: headerGroup.headers[vc.index],
                  start: vc.start,
                }))
                .filter(({ header }) => predicate(header))
                .map(({ header, start }) => {
                  return (
                    <DisplayHeader
                      key={header.id}
                      header={header}
                      defToRender={defToRender}
                    />
                  );
                })}
            </>
          )
        ) : (
          <>
            {virtualColumns
              .map((vc) => ({
                header: headerGroup.headers[vc.index],
                start: vc.start,
              }))
              .filter(({ header }) => predicate(header))
              .map(({ header, start }) => {
                return (
                  <DraggableTableHeader
                    key={header.id}
                    header={header}
                    table={table}
                    start={start}
                    offsetLeft={offsetLeft}
                    defToRender={defToRender}
                  />
                );
              })}
          </>
        )}
      </>
    );
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
