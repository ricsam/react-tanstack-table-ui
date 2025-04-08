import { useMeasureCellContext } from "../../measure_cell_context";
import { useTableContext } from "../table_context";
import { VirtualHeaderContext } from "./virtual_header/context";
import { VirtualHeader } from "./virtual_header/types";

export function VirtualHeaderCell({
  header,
  isLastPinned,
  isFirstPinned,
  isLast,
  isFirst,
  isFirstCenter,
  isLastCenter,
}: {
  header: VirtualHeader;
  isLastPinned: boolean;
  isFirstPinned: boolean;
  isLast: boolean;
  isFirst: boolean;
  isFirstCenter: boolean;
  isLastCenter: boolean;
}) {
  const measuring = useMeasureCellContext();
  const { skin } = useTableContext();
  if (measuring) {
    measuring.registerCell(header.headerId);
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
        isMeasuring={Boolean(measuring)}
        ref={
          measuring
            ? (ref) => {
                measuring.storeRef(ref, {
                  type: "header",
                  id: header.headerId,
                  columnId: header.columnId,
                  header: header.header,
                });
              }
            : undefined
        }
      />
    </VirtualHeaderContext.Provider>
  );
}
