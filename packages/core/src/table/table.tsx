import { Table } from "@tanstack/react-table";
import React from "react";
import { ColDndHandler, RowDndHandler } from "../dnd_handler";
import { useColContext } from "./cols/col_context";
import { ColProvider } from "./cols/col_provider";
import { HeaderGroup } from "./cols/header_group";
import { useRowContext } from "./rows/row_context";
import { RowProvider } from "./rows/row_provider";
import { TableBody } from "./table_body";
import { TableContext, useTableContext } from "./table_context";
import { Skin } from "../skin";
import { defaultSkin } from "../default_skin";

export const ReactTanstackTableUi = <T,>(props: {
  table: Table<T>;
  rowDndHandler?: RowDndHandler<T>;
  colDndHandler?: ColDndHandler<T>;
  skin?: Skin;
  getId: (row: T) => string;
  width: number;
  height: number;
}) => {
  const { table } = props;
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <TableContext.Provider
      value={{
        width: props.width,
        height: props.height,
        tableContainerRef: tableContainerRef,
        table,
        skin: props.skin ?? defaultSkin,
      }}
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
            <HeaderGroup
              {...headerGroup}
              key={headerGroup.id}
              Component={skin.TableHeaderRow}
              type="header"
            />
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
            <HeaderGroup
              {...footerGroup}
              key={footerGroup.id}
              Component={skin.TableFooterRow}
              type="footer"
            />
          );
        })}
      </skin.TableFooter>
    </skin.OuterContainer>
  );
}
