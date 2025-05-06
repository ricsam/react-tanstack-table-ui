import {
  Cell,
  CellContext,
  Header,
  HeaderContext,
  Row,
  Table,
} from "@tanstack/react-table";
import { Virtualizer } from "@tanstack/react-virtual";
import { MeasuredCell } from "../measure_cell_context";
import { RowDndHandler } from "../dnd_handler";
import { ColDndHandler } from "../dnd_handler";
import { HorOffsets } from "./cols/col_virtualizer_type";
import { Skin } from "../skin";

export type ReactTanstackTableUiProps<T> = {
  /** 
   * A Tanstack Table instance that provides the data, columns, and other table configuration.
   * @required
   */
  table: Table<T>;
  /** 
   * Optional handler for row drag and drop functionality.
   */
  rowDndHandler?: RowDndHandler<T>;
  /** 
   * Optional handler for column drag and drop functionality.
   */
  colDndHandler?: ColDndHandler<T>;
  /** 
   * Custom skin for styling the table.
   * @default import("@rttui/core").defaultSkin
   */
  skin?: Skin;
  /** 
   * Fixed width for the table in pixels.
   * @default Sum of all column widths
   */
  width?: number;
  /** 
   * Fixed height for the table in pixels.
   * @default Sum of all row heights
   */
  height?: number;
  /** 
   * Number of rows to render beyond the visible area.
   * @default 1
   */
  rowOverscan?: number;
  /** 
   * Number of columns to render beyond the visible area.
   * @default 1
   */
  columnOverscan?: number;
  /** 
   * Function that returns a React component to be rendered below each row.
   */
  renderSubComponent?: (row: Row<T>) => React.ReactNode;
  /** 
   * React component to be rendered inside the table container, below the table content.
   */
  underlay?: React.ReactNode;
  /** 
   * When `true`, all columns will be automatically resized to fit their content.
   * @default false
   */
  autoCrushColumns?: boolean;
  /** 
   * Controls whether pinned columns are positioned relative to the visible columns (`"cols"`) or the table edge (`"table"`).
   * @default "cols"
   */
  pinColsRelativeTo?: "cols" | "table";
  /** 
   * Controls whether pinned rows are positioned relative to the visible rows (`"rows"`) or the table edge (`"table"`).
   * @default "rows"
   */
  pinRowsRelativeTo?: "rows" | "table";
  /** 
   * Determines whether minimum column size should be based on the header, cell content, or both.
   * @default "both"
   */
  crushMinSizeBy?: "header" | "cell" | "both";
  /** 
   * When `true`, columns will expand to fill available space after crushing.
   * @default false
   */
  fillAvailableSpaceAfterCrush?: boolean;
  /** 
   * When filling available space, this value is used to calculate the correct width accounting for the scrollbar.
   * @default 16
   */
  scrollbarWidth?: number;
  /** 
   * Reference to access table measurements and internal state.
   */
  tableRef?: React.RefObject<RttuiRef | undefined>;
  /** 
   * Maximum number of columns to measure when `autoCrushColumns` is enabled.
   * @default 50
   */
  autoCrushNumCols?: number;
  /** 
   * Controls when cells/headers should re-render for performance optimization.
   */
  shouldUpdate?: ShouldUpdate;
  /** 
   * Maximum size (in pixels) that a column can be automatically resized to when crushing.
   */
  autoCrushMaxSize?: number;
  /**
   * Required when server side rendering.
   * If AutoSizer is used it is enough to provide initialWidth and initialHeight to the AutoSizer.
   */
  initialWidth?: number;
  /**
   * Required when server side rendering.
   * If AutoSizer is used it is enough to provide initialWidth and initialHeight to the AutoSizer.
   */
  initialHeight?: number;
  /** 
   * Debug options for table rendering.
   */
  debug?: {
    /** 
     * Will show the instance of the table where columns are measured to visually debug the CSS.
     * @default false
     */
    measureInstance?: boolean;
  };
};

export type UiProps = Omit<
  ReactTanstackTableUiProps<any>,
  | "table"
  | "skin"
  | "width"
  | "height"
  | "rowDndHandler"
  | "colDndHandler"
  | "autoCrushNumCols"
  | "pinColsRelativeTo"
  | "pinRowsRelativeTo"
  | "columnOverscan"
  | "rowOverscan"
  | "crushMinSizeBy"
> & {
  width: number;
  height: number;
  pinColsRelativeTo: "cols" | "table";
  pinRowsRelativeTo: "rows" | "table";
  columnOverscan: number;
  rowOverscan: number;
  crushMinSizeBy: "header" | "cell" | "both";
};

export type RttuiHeader = {
  groupIndex: number;
  /**
   * Absolute index of the header in the table
   */
  headerIndex: number;
  header: Header<any, any>;
  state: VirtualHeaderCellState;
};

export type RttuiHeaderGroup = {
  /**
   * Absolute index of the header group in the table
   */
  groupIndex: number;
  left: RttuiHeader[];
  center: RttuiHeader[];
  right: RttuiHeader[];
  offsetLeft: number;
  offsetRight: number;
  virtualizer: Virtualizer<any, any>;
};

export type RttuiHeaderGroups = {
  groups: RttuiHeaderGroup[];
  groupLookup: {
    [groupIndex: number]: RttuiHeaderGroup;
  };
  headerLookup: {
    [groupIndex: number]: {
      [headerIndex: number]: RttuiHeader;
    };
  };
};

export type RttuiCell = {
  /**
   * Absolute index of the column in the row
   */
  columnIndex: number;
  /**
   * Absolute index of the row in the table
   */
  rowIndex: number;
  cell: Cell<any, any>;
  header: RttuiHeader;
  state: VirtualHeaderCellState;
};

export type RttuiRow = {
  row: Row<any>;
  /**
   * Absolute index of the row in the table
   */
  rowIndex: number;
  left: RttuiCell[];
  right: RttuiCell[];
  center: RttuiCell[];
  /**
   * index relative to the group of rows, e.g. index relative to the bottom rows
   */
  relativeIndex: number;
};

export type RttuiTable = {
  uiProps: UiProps;
  tanstackTable: Table<any>;
  virtualData: {
    header: RttuiHeaderGroups;
    footer: RttuiHeaderGroups;
    isResizingColumn: string | false;
    isScrolling: {
      vertical: boolean;
      horizontal: boolean;
    };
    body: {
      rowVirtualizer: Virtualizer<any, any>;
      colVirtualizer: Virtualizer<any, any>;
      offsetLeft: number;
      offsetRight: number;
      offsetTop: number;
      offsetBottom: number;
      hasRows: boolean;
      cols: {
        left: RttuiHeader[];
        right: RttuiHeader[];
        center: RttuiHeader[];
      };
      rows: {
        top: RttuiRow[];
        center: RttuiRow[];
        bottom: RttuiRow[];
      };
      rowLookup: {
        [rowIndex: number]: RttuiRow;
      };
      cellLookup: {
        [rowIndex: number]: {
          [columnIndex: number]: RttuiCell;
        };
      };
    };
  };
};

export type PinPos = false | "start" | "end";
export type CombinedHeaderGroup = {
  id: string;
  _slow_headers: Header<any, unknown>[];
};

export type CellRefs = Record<
  string,
  {
    width: number;
  } & MeasuredCell
>;

export type MeasureData = {
  cells: CellRefs;
  cols: Map<string, CellRefs | undefined>;
};

export type RttuiRef = {
  autoSizeColumns: () => void;
};

type UpdateProps<T extends CellContext<any, any> | HeaderContext<any, any>> = {
  context: {
    prev: T;
    next: T;
  };
  isScrolling: RttuiTable["virtualData"]["isScrolling"];
  isResizingColumn: string | false;
};

export type ShouldUpdate = {
  cell?: (props: UpdateProps<CellContext<any, any>>) => boolean;
  header?: (props: UpdateProps<HeaderContext<any, any>>) => boolean;
};

type VirtualCell = {
  id: string;
  cell: () => Cell<any, any>;
  vheader: VirtualHeaderCell;
};

export type VirtualRow = {
  id: string;
  row: () => Row<any>;
  isPinned: () => PinPos;
  flatIndex: number;
  getCells: () => VirtualCell[];
  rowVirtualizer: Virtualizer<any, any>;
};

export type VirtualHeaderCell = {
  id: string;
  type: "header" | "footer";
  columnId: string;
  getIndex: () => number;
  header: () => Header<any, any>;
  getState: () => VirtualHeaderCellState;
};

export type VirtualHeaderCellState = {
  width: number;
  isLastPinned: boolean;
  isFirstPinned: boolean;
  isLast: boolean;
  isFirst: boolean;
  isFirstCenter: boolean;
  isLastCenter: boolean;
  isPinned: PinPos;
};
export type VirtualHeaderGroup = {
  id: string;
  type: "header" | "footer";
  getHeaders: () => VirtualHeaderCell[];
  getOffsets: () => HorOffsets;
  getVirtualizer: () => Virtualizer<any, any>;
};
