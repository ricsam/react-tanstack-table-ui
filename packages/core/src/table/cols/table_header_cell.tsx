import React from "react";
import { useMeasureCellContext } from "../../measure_cell_context";
import { useTableContext } from "../table_context";
import { VirtualHeaderContext } from "./virtual_header/context";
import { VirtualHeaderCell as VirtualHeaderCell } from "./virtual_header/types";

export const TableHeaderCell = React.memo(function TableHeaderCell({
  header,
}: {
  header: VirtualHeaderCell;
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
});
