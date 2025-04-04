import { Row, Table } from "@tanstack/react-table";
import React from "react";
import { defaultSkin } from "../default_skin/default_skin";
import { ColDndHandler, RowDndHandler } from "../dnd_handler";
import { MeasureCellProvider } from "../measure_cell_provider";
import { Skin } from "../skin";
import { useColContext } from "./cols/col_context";
import { ColProvider } from "./cols/col_provider";
import { HeaderGroup } from "./cols/header_group";
import { useVirtualRowContext } from "./rows/virtual_row_context";
import { VirtualRowProvider } from "./rows/virtual_row_provider";
import { TableBody } from "./table_body";
import { TableContext, useTableContext } from "./table_context";
import { MeasureData } from "./types";

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
  autoSizeColumns?: boolean;
}) {
  const { table } = props;
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [onMeasureCb, setOnMeasureCb] = React.useState<
    undefined | ((measureData: MeasureData) => void)
  >(undefined);

  const measureCells = React.useCallback(
    (cb: (measureData: MeasureData) => void) =>
      setOnMeasureCb(() => {
        return (measureData: MeasureData) => {
          cb(measureData);
          setOnMeasureCb(undefined);
        };
      }),
    [],
  );

  const tableRef = React.useRef(table);
  tableRef.current = table;

  React.useEffect(() => {
    if (!props.autoSizeColumns) {
      return;
    }

    const onMeasureCb = ({ cols }: MeasureData) => {
      tableRef.current.setColumnSizing((prev) => {
        const newSizing = { ...prev };
        cols.forEach((col, colId) => {
          if (!col) {
            return;
          }
          newSizing[colId] = Math.max(...col.map(({ rect }) => rect.width));
        });
        return newSizing;
      });
    };

    measureCells(onMeasureCb);
  }, [measureCells, props.autoSizeColumns]);

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
          onMeasureCallback: onMeasureCb,
          measureCells,
        }),
        [
          props.width,
          props.height,
          props.skin,
          props.rowOverscan,
          props.columnOverscan,
          props.renderSubComponent,
          table,
          onMeasureCb,
          measureCells,
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
  const { skin, onMeasureCallback } = useTableContext();
  const { rows, offsetBottom, offsetTop } = useVirtualRowContext();
  const { footerGroups, headerGroups } = useColContext();

  const body = (
    <TableBody
      rows={rows}
      offsetBottom={offsetBottom}
      offsetTop={offsetTop}
    ></TableBody>
  );

  return (
    <skin.OverlayContainer>
      <skin.OuterContainer>
        {underlay}

        <skin.TableScroller />

        <skin.TableHeader>
          {headerGroups.map((headerGroup) => {
            return (
              <HeaderGroup
                key={headerGroup.id}
                {...headerGroup}
                type="header"
              />
            );
          })}
        </skin.TableHeader>

        {body}

        {onMeasureCallback && (
          <div
            className="rtui-measure-container"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              visibility: "hidden",
              pointerEvents: "none",
              zIndex: -1,
            }}
          >
            <MeasureCellProvider onMeasureCallback={onMeasureCallback}>
              {body}
            </MeasureCellProvider>
          </div>
        )}

        <skin.TableFooter>
          {footerGroups.map((footerGroup) => {
            return (
              <HeaderGroup
                key={footerGroup.id}
                {...footerGroup}
                type="footer"
              />
            );
          })}
        </skin.TableFooter>
        {skin.PinnedColsOverlay && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "var(--table-width)",
              height: "var(--table-height)",
              backgroundColor: "transparent",
              zIndex: 1000,
              display: "flex",
              pointerEvents: "none",
            }}
          >
            <skin.PinnedColsOverlay position="left" />
            <div style={{ flex: 1 }}></div>
            <skin.PinnedColsOverlay position="right" />
          </div>
        )}
      </skin.OuterContainer>
    </skin.OverlayContainer>
  );
}
