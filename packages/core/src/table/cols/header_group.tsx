import { HeaderGroup as HeaderGroupType } from "@tanstack/react-table";
import { DraggableTableHeader, VirtualHeader } from "./draggable_table_header";

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
  Component,
}: VirtualHeaderGroup & {
  Component: React.FC<{ children: React.ReactNode }>;
}) {
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
    <Component>
      {loop(headers.filter((header) => header.isPinned === "start"))}
      <div style={{ width: offsetLeft }}></div>
      {loop(headers.filter((header) => header.isPinned === false))}
      <div style={{ width: offsetRight }}></div>
      {loop(headers.filter((header) => header.isPinned === "end"))}
    </Component>
  );
}
