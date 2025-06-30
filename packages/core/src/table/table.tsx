import { Column, ColumnDef, RowData } from "@tanstack/react-table";
import React from "react";
import { defaultSkin } from "../default_skin/default_skin";
import { MeasureCellProvider } from "../measure_cell_provider";
import { shallowEqual } from "../utils";
import { HeaderGroup } from "./cols/header_group";
import { MeasureContext, MeasureContextType } from "./contexts/measure_context";
import { useMeasureContext } from "./hooks/use_measure_context";
import { useListenToTableProps, useTableProps } from "./hooks/use_table_props";
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
import { AutoSizerContext } from "./contexts/auto_sizer_context";
import ReactDOM from "react-dom";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    /**
     * @default true
     */
    autoCrush?: boolean;
    /**
     * @default true
     */
    fillAvailableSpaceAfterCrush?: boolean;
    /**
     * @default "both"
     */
    crushMinSizeBy?: "header" | "cell" | "both";

    autoCrushMaxSize?: number;
  }
}

export const ReactTanstackTableUi = function ReactTanstackTableUi<T>(
  props: ReactTanstackTableUiProps<T>,
) {
  const autoSizerContext = React.useContext(AutoSizerContext);
  const width = props.width ?? autoSizerContext?.width;
  const height = props.height ?? autoSizerContext?.height;
  if (props.width || props.height) {
    autoSizerContext?.notify({
      type: "fixedSize",
      size: { width: props.width, height: props.height },
    });
  }
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);
  return (
    <MeasureProvider
      width={width}
      height={height}
      crushMinSizeBy={props.crushMinSizeBy ?? "both"}
      scrollbarWidth={props.scrollbarWidth ?? 16}
      skin={props.skin}
      fillAvailableSpaceAfterCrush={props.fillAvailableSpaceAfterCrush ?? true}
      autoCrushColumns={props.autoCrushColumns ?? true}
      tableRef={props.tableRef}
      table={props.table}
      autoCrushNumCols={props.autoCrushNumCols ?? 50}
      autoCrushMaxSize={props.autoCrushMaxSize}
    >
      <MeasureSwitch
        debug={props.debug?.measureInstance}
        tableContainerRef={tableContainerRef}
      >
        <TablePropsProvider>
          <TablePropsUpdater
            {...props}
            width={width}
            height={height}
            initialWidth={props.initialWidth ?? autoSizerContext?.initialWidth}
            initialHeight={
              props.initialHeight ?? autoSizerContext?.initialHeight
            }
            tableContainerRef={tableContainerRef}
          />
        </TablePropsProvider>
      </MeasureSwitch>
    </MeasureProvider>
  );
};

function MeasureSwitch(props: {
  children: React.ReactNode;
  debug?: boolean;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
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

  if (
    measuringContext.isMeasuring &&
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    document.body
  ) {
    measuringInstance = ReactDOM.createPortal(
      <MeasureContext.Provider value={measuringContext}>
        <div
          className="rttui-measure-container"
          style={
            !props.debug
              ? {
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  visibility: "hidden",
                  pointerEvents: "none",
                  transform: "translateZ(0)",
                  zIndex: -1,
                  contain: "strict",
                  zoom: 1,
                }
              : {
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 1000,
                  contain: "strict",
                  pointerEvents: "none",
                  zoom: 1,
                }
          }
        >
          <MeasureCellProvider isMeasuring={measuringContext.isMeasuring}>
            {props.children}
          </MeasureCellProvider>
        </div>
      </MeasureContext.Provider>,
      document.body,
    );
  }

  const debugInstance = React.useRef(measuringInstance);
  if (measuringInstance) {
    debugInstance.current = measuringInstance;
  }

  return (
    <div
      className="rttui-table-container"
      style={{
        width: context.width + "px",
        height: context.height + "px",
        position: "relative",
      }}
      ref={props.tableContainerRef}
    >
      {measuringInstance}
      {!measuringInstance && props.debug && debugInstance.current}
      <MeasureContext.Provider value={nonMeasuringContext}>
        {props.children}
      </MeasureContext.Provider>
    </div>
  );
}

function TablePropsUpdater(
  props: ReactTanstackTableUiProps<any> & {
    tableContainerRef: React.RefObject<HTMLDivElement | null>;
  },
) {
  const { table, tableContainerRef } = props;
  const measureContext = useMeasureContext();

  //#region validate props
  if (table.getIsSomeColumnsPinned() && !table.options.enableColumnPinning) {
    throw new Error(
      "column pinning will not work unless enableColumnPinning is set to true",
    );
  }
  if (table.getIsSomeRowsPinned() && !table.options.enableRowPinning) {
    throw new Error(
      "row pinning will not work unless enableRowPinning is set to true",
    );
  }
  const tableState = table.getState();

  if (
    tableState.columnFilters.length > 0 &&
    (!table.options.enableColumnFilters || !table.options.getFilteredRowModel)
  ) {
    throw new Error(
      "column filtering will not work unless enableColumnFilters is set to true and getFilteredRowModel is provided",
    );
  }

  if (table.getIsSomeRowsSelected() && !table.options.enableRowSelection) {
    throw new Error(
      "row selection will not work unless enableRowSelection is set to true",
    );
  }
  if (
    tableState.columnSizingInfo.isResizingColumn &&
    table.options.columnResizeMode !== "onChange"
  ) {
    throw new Error(
      "columnResizeMode must be set to 'onChange' to use the column resizing feature",
    );
  }
  if (
    tableState.sorting.length > 0 &&
    (!table.options.enableSorting || !table.options.getSortedRowModel)
  ) {
    throw new Error(
      "sorting will not work unless enableSorting is set to true and getSortedRowModel is provided",
    );
  }

  const cols = props.table.options.columns;
  React.useEffect(() => {
    const colIds = new Set<string>();
    const iterateOverCols = (cols: ColumnDef<any, any>[]) => {
      cols.forEach((col) => {
        if (col.id) {
          if (colIds.has(col.id)) {
            throw new Error("column ids must be unique");
          }
          colIds.add(col.id);
          if ("columns" in col && col.columns) {
            iterateOverCols(col.columns);
          }
        } else {
          throw new Error("All columns must have an id");
        }
      });
    };
    iterateOverCols(cols);
  }, [cols]);

  //#endregion

  const uiProps: UiProps = {
    width: measureContext.width,
    height: measureContext.height,
    rowOverscan: props.rowOverscan ?? 1,
    columnOverscan: measureContext.isMeasuring
      ? (props.autoCrushNumCols ?? 50)
      : (props.columnOverscan ?? 1),
    renderSubComponent: props.renderSubComponent,
    underlay: props.underlay,
    autoCrushColumns: props.autoCrushColumns ?? true,
    pinColsRelativeTo: props.pinColsRelativeTo ?? "cols",
    pinRowsRelativeTo: props.pinRowsRelativeTo ?? "rows",
    crushMinSizeBy: props.crushMinSizeBy ?? "both",
    fillAvailableSpaceAfterCrush: props.fillAvailableSpaceAfterCrush ?? true,
    scrollbarWidth: props.scrollbarWidth ?? 16,
    tableRef: props.tableRef,
    shouldUpdate: props.shouldUpdate,
    spreadsheetMode: props.spreadsheetMode,
  };

  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  const skin = props.skin ?? defaultSkin;

  const rttuiRef = useRttuiTable({
    table: props.table,
    uiProps,
    scrollContainerRef,
    skin,
  });

  const renderHeaderPlaceholderRef = React.useRef(
    props.renderHeaderPlaceholder,
  );
  renderHeaderPlaceholderRef.current = props.renderHeaderPlaceholder;

  // tanstack table causes a re-render when its state changes
  // but we don't want <ReactTanstackTableUi /> to update just because the parent updates, only if the table state changes
  // or one of the other ReactTanstackTableUiProps changes
  // we trigger updates to the useTableProps hooks when the table state changes so it can re-render if the data the particular useTableProps hook depends on changes
  return (
    <TableContext.Provider
      value={React.useMemo((): TableContextType => {
        return {
          scrollContainerRef,
          loading: Boolean(measureContext.isMeasuringInstanceLoading),
          skin,
          tableRef: rttuiRef,
          renderHeaderPlaceholder: (headerDef, headerContext) => {
            if (renderHeaderPlaceholderRef.current) {
              return renderHeaderPlaceholderRef.current(
                headerDef,
                headerContext,
              );
            }
            return null;
          },
        };
      }, [measureContext.isMeasuringInstanceLoading, skin, rttuiRef])}
    >
      <Body
        tableContainerRef={
          !measureContext.isMeasuring ? tableContainerRef : undefined
        }
      />
    </TableContext.Provider>
  );
}

const Body = React.memo(function Body({
  tableContainerRef,
}: {
  tableContainerRef: React.RefObject<HTMLDivElement | null> | undefined;
}) {
  const { skin } = useTableContext();

  const { pinColsRelativeTo, underlay, selection } = useTableProps({
    callback: (props) => {
      return {
        pinColsRelativeTo: props.uiProps.pinColsRelativeTo,
        underlay: props.uiProps.underlay,
        selection: props.selection,
      };
    },
    dependencies: [{ type: "ui_props" }],
  });

  const { listenTo } = useListenToTableProps();
  React.useEffect(() => {
    if (!tableContainerRef) {
      return;
    }
    const ref = tableContainerRef.current;
    if (ref) {
      const preventDefault = (e: Event) => {
        e.preventDefault();
        document.getSelection()?.empty();
      };
      const cleanups = [
        listenTo([{ type: "selection" }], (table) => {
          if (table.selection.isSelecting) {
            ref.addEventListener("selectstart", preventDefault);
            ref.addEventListener("selectionchange", preventDefault);
            return () => {
              ref.removeEventListener("selectstart", preventDefault);
              ref.removeEventListener("selectionchange", preventDefault);
            };
          }
        }),
        listenTo([{ type: "selection" }], (table) => {
          if (!table.selection.hasFocus()) {
            return;
          }
          const handler = (ev: KeyboardEvent) => {
            table.selection.handleKeyDown(ev);
          };
          window.addEventListener("keydown", handler);
          return () => {
            window.removeEventListener("keydown", handler);
          };
        }),
      ];
      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    }
  }, [listenTo, tableContainerRef]);

  React.useEffect(() => {
    if (!tableContainerRef) {
      return;
    }
    const ref = tableContainerRef.current;
    if (ref) {
      const clickAwayListener = (e: MouseEvent) => {
        if (!ref.contains(e.target as Node)) {
          selection.blur();
        } else {
          selection.focus();
        }
      };
      document.addEventListener("click", clickAwayListener);
      return () => {
        document.removeEventListener("click", clickAwayListener);
      };
    }
  }, [tableContainerRef, selection]);

  return (
    <skin.OverlayContainer>
      <skin.ScrollContainer>
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
      </skin.ScrollContainer>
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
