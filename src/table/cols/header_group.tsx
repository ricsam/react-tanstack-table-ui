import { HeaderGroup as HeaderGroupType } from "@tanstack/react-table";
import { DraggableTableHeader, VirtualHeader } from "./draggable_table_header";
import { useTableContext } from "../table_context";

export type VirtualHeaderGroup = {
  offsetLeft: number;
  offsetRight: number;
  headers: VirtualHeader[];
  headerGroup: HeaderGroupType<any>;
  id: string;
};

export function HeaderGroup({
  offsetLeft,
  offsetRight,
  headers,
}: VirtualHeaderGroup) {
  const { rowHeight } = useTableContext();

  const loop = (headers: VirtualHeader[]) => {
    const draggableHeader = (
      <>
        {headers.map((header) => {
          return <DraggableTableHeader key={header.headerId} {...header} />;
        })}
      </>
    );

    return draggableHeader;
  };

  return (
    <div
      className="header-group"
      style={{
        display: "flex",
        height: rowHeight,
      }}
    >
      {loop(headers.filter((header) => header.isPinned === "start"))}
      <div style={{ width: offsetLeft }}></div>
      {loop(headers.filter((header) => header.isPinned === false))}
      <div style={{ width: offsetRight }}></div>
      {loop(headers.filter((header) => header.isPinned === "end"))}
    </div>
  );
}
