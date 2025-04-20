import { Column, RowData } from "@tanstack/react-table";
import React from "react";
import { defaultSkin } from "../default_skin/default_skin";
import { MeasureCellProvider } from "../measure_cell_provider";
import { shallowEqual } from "../utils";
import { HeaderGroup } from "./cols/header_group";
import { MeasureContext, MeasureContextType } from "./contexts/measure_context";
import { useMeasureContext } from "./hooks/use_measure_context";
import { useTableProps } from "./hooks/use_table_props";
import { MeasureProvider } from "./providers/measure_provider";
import { TablePropsProvider } from "./providers/table_props_provider";
import { TableBody } from "./table_body";
import {
  TableContext,
  TableContextType,
  useTableContext,
} from "./table_context";
import { ReactTanstackTableUiProps, UiProps } from "./types";
import { useRttuiTable } from "./use_rttui_table";
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    autoCrush?: boolean;
    fillAvailableSpaceAfterCrush?: boolean;
    crushMinSizeBy?: "header" | "cell" | "both";
  }
}

export const ReactTanstackTableUi = function ReactTanstackTableUi<T>(
  props: ReactTanstackTableUiProps<T>,
) {
  return (
    <MeasureProvider
      width={props.width}
      height={props.height}
      crushMinSizeBy={props.crushMinSizeBy}
      scrollbarWidth={props.scrollbarWidth}
      skin={props.skin}
      fillAvailableSpaceAfterCrush={props.fillAvailableSpaceAfterCrush}
      autoCrushColumns={props.autoCrushColumns}
      tableRef={props.tableRef}
      table={props.table}
      autoCrushNumCols={props.autoCrushNumCols}
    >
      <MeasureSwitch>
        <TablePropsProvider>
          <TablePropsUpdater {...props} />
        </TablePropsProvider>
      </MeasureSwitch>
    </MeasureProvider>
  );
};

function MeasureSwitch(props: { children: React.ReactNode }) {
  const context = useMeasureContext();

  const nonMeasuringContext = React.useMemo(
    (): MeasureContextType => ({
      ...context,
      isMeasuring: undefined,
      isMeasuringInstanceLoading: Boolean(context.isMeasuring),
    }),
    [context],
  );

  const measuringContext = React.useMemo(
    (): MeasureContextType => ({
      ...context,
      // weird if the measuring instance would accidently call measure cells for some reason
      measureCells: () => {},
      // the measuring instance doesn't need to know if it is loading or not
      // better that we set it to false to not interfere with the measuring
      isMeasuringInstanceLoading: false,
    }),
    [context],
  );

  let measuringInstance: React.ReactNode | undefined;

  if (measuringContext.isMeasuring) {
    measuringInstance = (
      <MeasureContext.Provider value={measuringContext}>
        <div
          className="rttui-measure-container"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            visibility: "hidden",
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <MeasureCellProvider isMeasuring={measuringContext.isMeasuring}>
            {props.children}
          </MeasureCellProvider>
        </div>
      </MeasureContext.Provider>
    );
  }

  return (
    <div
      className="rttui-table-container"
      style={{
        width: context.width + "px",
        height: context.height + "px",
        position: "relative",
      }}
    >
      {measuringInstance}
      <MeasureContext.Provider value={nonMeasuringContext}>
        {props.children}
      </MeasureContext.Provider>
    </div>
  );
}

function TablePropsUpdater(props: ReactTanstackTableUiProps<any>) {
  const { table } = props;
  const measureContext = useMeasureContext();

  // validate props
  if (table.getIsSomeColumnsPinned() && !table.options.enableColumnPinning) {
    throw new Error(
      "column pinning will not work unless enableColumnPinning is set to true",
    );
  }

  const uiProps: UiProps = {
    width: measureContext.width,
    height: measureContext.height,
    rowOverscan: props.rowOverscan ?? 10,
    columnOverscan: measureContext.isMeasuring
      ? (props.autoCrushNumCols ?? 50)
      : (props.columnOverscan ?? 3),
    renderSubComponent: props.renderSubComponent,
    underlay: props.underlay,
    autoCrushColumns: props.autoCrushColumns,
    pinColsRelativeTo: props.pinColsRelativeTo ?? "cols",
    pinRowsRelativeTo: props.pinRowsRelativeTo ?? "rows",
    crushMinSizeBy: props.crushMinSizeBy ?? "header",
    fillAvailableSpaceAfterCrush: props.fillAvailableSpaceAfterCrush,
    scrollbarWidth: props.scrollbarWidth,
    tableRef: props.tableRef,
    shouldUpdate: props.shouldUpdate,
  };

  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);

  const skin = props.skin ?? defaultSkin;

  const rttuiRef = useRttuiTable({
    table: props.table,
    uiProps,
    tableContainerRef,
    skin,
  });

  // tanstack table causes a re-render when its state changes
  // but we don't want <ReactTanstackTableUi /> to update just because the parent updates, only if the table state changes
  // or one of the other ReactTanstackTableUiProps changes
  // we trigger updates to the useTableProps hooks when the table state changes so it can re-render if the data the particular useTableProps hook depends on changes
  return (
    <TableContext.Provider
      value={React.useMemo((): TableContextType => {
        return {
          tableContainerRef,
          loading: Boolean(measureContext.isMeasuringInstanceLoading),
          skin,
          tableRef: rttuiRef,
        };
      }, [measureContext.isMeasuringInstanceLoading, skin, rttuiRef])}
    >
      <Body />
    </TableContext.Provider>
  );
}

const Body = React.memo(function Body() {
  const { skin, loading } = useTableContext();

  const { pinColsRelativeTo, underlay } = useTableProps({
    callback: (props) => {
      return {
        pinColsRelativeTo: props.uiProps.pinColsRelativeTo,
        underlay: props.uiProps.underlay,
      };
    },
    dependencies: [{ type: "ui_props" }],
  });

  return (
    <skin.OverlayContainer>
      <skin.OuterContainer>
        {underlay}

        <skin.TableScroller />

        {/* Regular content */}
        <Content />

        {skin.PinnedColsOverlay && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width:
                pinColsRelativeTo === "table"
                  ? "max(var(--table-width), 100%)"
                  : "var(--table-width)",
              height:
                "max(var(--table-height) + var(--header-height) + var(--footer-height), 100%)",
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
});

const Content = React.memo(function Content() {
  const crushMinSizeBy = useTableProps({
    callback: (props) => {
      const crushMinSizeBy = props.uiProps.crushMinSizeBy;
      for (const header of [
        ...Object.values(props.virtualData.header.headerLookup).flatMap(
          (group) => Object.values(group),
        ),
        ...Object.values(props.virtualData.footer.headerLookup).flatMap(
          (group) => Object.values(group),
        ),
      ]) {
        const headerInstance = header.header;
        const hCrushMinSizeBy =
          headerInstance.column.columnDef.meta?.crushMinSizeBy;
        if (hCrushMinSizeBy && crushMinSizeBy !== hCrushMinSizeBy) {
          return "both";
        }
        //#region maybe unnecessary
        const getAncestor = (col: Column<any>): Column<any> => {
          const parent = col.parent;
          if (parent) {
            return getAncestor(parent);
          }
          return col;
        };
        const ancestor = getAncestor(headerInstance.column);
        const children = ancestor.getFlatColumns();
        for (const child of children) {
          const hCrushMinSizeBy = child.columnDef.meta?.crushMinSizeBy;
          if (hCrushMinSizeBy && crushMinSizeBy !== hCrushMinSizeBy) {
            return "both";
          }
        }
        //#endregion
      }
      return crushMinSizeBy;
    },
    areCallbackOutputEqual: (prev, next) => {
      return prev === next;
    },
    dependencies: [
      { type: "tanstack_table" },
      { type: "ui_props" },
      {
        /* any change to any visible_range */
        type: "col_visible_range",
      },
    ],
  });

  const isMeasureInstance = Boolean(useMeasureContext().isMeasuring);

  let tableHeader: React.ReactNode | undefined;
  let tableBody: React.ReactNode | undefined;
  let tableFooter: React.ReactNode | undefined;

  if (!isMeasureInstance || crushMinSizeBy !== "cell") {
    tableHeader = <TableHeaderGroups type="header" />;
  }

  if (!isMeasureInstance || crushMinSizeBy !== "cell") {
    tableFooter = <TableHeaderGroups type="footer" />;
  }

  if (!isMeasureInstance || crushMinSizeBy !== "header") {
    tableBody = <TableBody />;
  }

  return (
    <>
      {tableHeader}
      {tableBody}
      {tableFooter}
    </>
  );
});

const TableHeaderGroups = React.memo(function TableHeaderGroups({
  type,
}: {
  type: "header" | "footer";
}) {
  const { skin } = useTableContext();

  const headerGroups = useTableProps({
    callback: (props) => {
      const headerGroups =
        type === "header"
          ? props.virtualData.header.groups
          : props.virtualData.footer.groups;
      return headerGroups.map((group) => group.groupIndex);
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [{ type: "tanstack_table" }],
  });

  if (headerGroups.length === 0) {
    return null;
  }
  const Wrapper = type === "header" ? skin.TableHeader : skin.TableFooter;
  return (
    <Wrapper>
      {headerGroups.map((groupIndex) => {
        return (
          <HeaderGroup key={groupIndex} groupIndex={groupIndex} type={type} />
        );
      })}
    </Wrapper>
  );
});
