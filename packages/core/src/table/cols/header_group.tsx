import { useTableContext } from "../table_context";
import { CombinedHeaderGroup, PinPos } from "../types";
import { VirtualHeaderContext } from "./virtual_header/context";
import { VirtualHeader } from "./virtual_header/types";
export type VirtualHeaderGroup = {
  offsetLeft: number;
  offsetRight: number;
  headers: VirtualHeader[];
  headerGroup: CombinedHeaderGroup;
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
  const allHeaders = headers;
  const loop = (headers: VirtualHeader[], pinned: PinPos) => {
    const draggableHeader = (
      <>
        {headers.map((header, index) => {
          let isLastPinned = false;
          let isFirstPinned = false;
          if (pinned === "start") {
            isLastPinned = index === headers.length - 1;
            isFirstPinned = index === 0;
          } else if (pinned === "end") {
            isLastPinned = index === 0;
            isFirstPinned = index === headers.length - 1;
          }
          let isLast = false;
          let isFirst = false;

          if (allHeaders[0].headerId === header.headerId) {
            isFirst = true;
          }
          if (allHeaders[allHeaders.length - 1].headerId === header.headerId) {
            isLast = true;
          }
          let isFirstCenter = false;
          let isLastCenter = false;
          if (pinned === false) {
            isLastCenter = index === headers.length - 1;
            isFirstCenter = index === 0;
          }

          return (
            <VirtualHeaderContext.Provider value={header} key={header.headerId}>
              <skin.HeaderCell
                {...header}
                isLastPinned={isLastPinned}
                isFirstPinned={isFirstPinned}
                isLast={isLast}
                isFirst={isFirst}
                isFirstCenter={isFirstCenter}
                isLastCenter={isLastCenter}
              />
            </VirtualHeaderContext.Provider>
          );
        })}
      </>
    );

    return draggableHeader;
  };

  const pinnedLeft = headers.filter((header) => header.isPinned === "start");
  const pinnedRight = headers.filter((header) => header.isPinned === "end");
  const { skin, pinColsRelativeTo } = useTableContext();

  return (
    <skin.HeaderRow type={type}>
      <skin.PinnedCols position="left" pinned={pinnedLeft} type={type}>
        {loop(pinnedLeft, "start")}
      </skin.PinnedCols>
      <div style={{ minWidth: offsetLeft, flexShrink: 0 }}></div>
      {loop(
        headers.filter((header) => header.isPinned === false),
        false,
      )}
      <div
        style={{
          minWidth: offsetRight,
          flexShrink: 0,
          flexGrow: pinColsRelativeTo === "table" ? 1 : 0,
        }}
      ></div>
      <skin.PinnedCols position="right" pinned={pinnedRight} type={type}>
        {loop(pinnedRight, "end")}
      </skin.PinnedCols>
    </skin.HeaderRow>
  );
}
