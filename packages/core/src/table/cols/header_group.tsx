import { HeaderGroup as HeaderGroupType } from "@tanstack/react-table";
import { VirtualHeader } from "./virtual_header/types";
import { useTableContext } from "../table_context";
import { VirtualHeaderContext } from "./virtual_header/context";
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
  type,
}: VirtualHeaderGroup & {
  type: "header" | "footer";
}) {
  const loop = (headers: VirtualHeader[]) => {
    const draggableHeader = (
      <>
        {headers.map((header) => {
          return (
            <VirtualHeaderContext.Provider value={header} key={header.headerId}>
              <skin.HeaderCell {...header} />
            </VirtualHeaderContext.Provider>
          );
        })}
      </>
    );

    return draggableHeader;
  };

  const pinnedLeft = headers.filter((header) => header.isPinned === "start");
  const pinnedRight = headers.filter((header) => header.isPinned === "end");
  const { skin } = useTableContext();

  return (
    <skin.HeaderRow type={type}>
      <skin.PinnedCols position="left" pinned={pinnedLeft} type={type}>
        {loop(pinnedLeft)}
      </skin.PinnedCols>
      <div style={{ width: offsetLeft }}></div>
      {loop(headers.filter((header) => header.isPinned === false))}
      <div style={{ width: offsetRight }}></div>
      <skin.PinnedCols position="right" pinned={pinnedRight} type={type}>
        {loop(pinnedRight)}
      </skin.PinnedCols>
    </skin.HeaderRow>
  );
}
