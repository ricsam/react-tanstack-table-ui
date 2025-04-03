import { Row, Table } from "@tanstack/react-table";
import React from "react";
import { defaultSkin } from "../default_skin/default_skin";
import { ColDndHandler, RowDndHandler } from "../dnd_handler";
import { Skin } from "../skin";
import { useColContext } from "./cols/col_context";
import { ColProvider } from "./cols/col_provider";
import { HeaderGroup } from "./cols/header_group";
import { useVirtualRowContext } from "./rows/virtual_row_context";
import { VirtualRowProvider } from "./rows/virtual_row_provider";
import { TableBody } from "./table_body";
import { TableContext, useTableContext } from "./table_context";

export const ReactTanstackTableUi = function ReactTanstackTableUi<T>(props: {
  table: Table<T>;
  rowDndHandler?: RowDndHandler<T>;
  colDndHandler?: ColDndHandler<T>;
  skin?: Skin;
  width: number;
  height: number;
  rowOverscan?: number;
  columnOverscan?: number;
  renderSubComponent?: (args: { row: Row<T> }) => React.ReactNode;
  underlay?: React.ReactNode;
}) {
  const { table } = props;
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <TableContext.Provider
      value={React.useMemo(
        () => ({
          width: props.width,
          height: props.height,
          tableContainerRef: tableContainerRef,
          table,
          skin: props.skin ?? defaultSkin,
          config: {
            rowOverscan: props.rowOverscan ?? 10,
            columnOverscan: props.columnOverscan ?? 3,
          },
          renderSubComponent: props.renderSubComponent,
        }),
        [
          props.width,
          props.height,
          table,
          props.skin,
          props.rowOverscan,
          props.columnOverscan,
          props.renderSubComponent,
        ],
      )}
    >
      <ColProvider>
        <VirtualRowProvider>
          <Body underlay={props.underlay} />
        </VirtualRowProvider>
      </ColProvider>
    </TableContext.Provider>
  );
};

function Body({ underlay }: { underlay?: React.ReactNode }) {
  const { skin } = useTableContext();
  const { rows, offsetBottom, offsetTop } = useVirtualRowContext();
  const { footerGroups, headerGroups } = useColContext();

  return (
    <skin.OuterContainer>
      {underlay}

      <skin.TableScroller />

      <skin.TableHeader>
        {headerGroups.map((headerGroup) => {
          return (
            <HeaderGroup key={headerGroup.id} {...headerGroup} type="header" />
          );
        })}
      </skin.TableHeader>

      <TableBody
        rows={rows}
        offsetBottom={offsetBottom}
        offsetTop={offsetTop}
      ></TableBody>

      <skin.TableFooter>
        {footerGroups.map((footerGroup) => {
          return (
            <HeaderGroup key={footerGroup.id} {...footerGroup} type="footer" />
          );
        })}
      </skin.TableFooter>
    </skin.OuterContainer>
  );
}
