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
  Component,
  type,
}: VirtualHeaderGroup & {
  Component: React.FC<{ children: React.ReactNode }>;
  type: 'header' | 'footer'
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

  const pinnedLeft = headers.filter((header) => header.isPinned === "start");
  const pinnedRight = headers.filter((header) => header.isPinned === "end");
  const { skin } = useTableContext();

  return (
    <Component>
      <skin.PinnedCols position="left" pinned={pinnedLeft} type={type}>
        {loop(pinnedLeft)}
      </skin.PinnedCols>
      <div style={{ width: offsetLeft }}></div>
      {loop(headers.filter((header) => header.isPinned === false))}
      <div style={{ width: offsetRight }}></div>
      <skin.PinnedCols position="right" pinned={pinnedRight} type={type}>
        {loop(pinnedRight)}
      </skin.PinnedCols>
    </Component>
  );
}
