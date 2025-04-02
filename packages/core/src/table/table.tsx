import { Table } from "@tanstack/react-table";
import React from "react";
import { defaultSkin } from "../default_skin/default_skin";
import { ColDndHandler, RowDndHandler } from "../dnd_handler";
import { Skin } from "../skin";
import { useColContext } from "./cols/col_context";
import { ColProvider } from "./cols/col_provider";
import { HeaderGroup } from "./cols/header_group";
import { useRowContext } from "./rows/row_context";
import { RowProvider } from "./rows/row_provider";
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
        }),
        [
          props.width,
          props.height,
          table,
          props.skin,
          props.rowOverscan,
          props.columnOverscan,
        ],
      )}
    >
      <ColProvider>
        <RowProvider>
          <Body />
        </RowProvider>
      </ColProvider>
    </TableContext.Provider>
  );
};

function Body() {
  const { skin } = useTableContext();
  const { rows, offsetBottom, offsetTop } = useRowContext();
  const { footerGroups, headerGroups } = useColContext();

  return (
    <skin.OuterContainer>
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
