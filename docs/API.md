# API Reference

## ReactTanstackTableUi Props Overview

### Core Props

| Prop | Type | Default |
|------|------|---------|
| [`table`](#table) | `Table` | **Required** |
| [`width`](#dimensions) | `number` | Sum of column widths |
| [`height`](#dimensions) | `number` | Sum of row heights |
| [`skin`](#skin) | `Skin` | `import("@rttui/core").defaultSkin` |

### Virtualization Options

| Prop | Type | Default |
|------|------|---------|
| [`rowOverscan`](#overscan) | `number` | `1` |
| [`columnOverscan`](#overscan) | `number` | `1` |

### Column Sizing Options

| Prop | Type | Default |
|------|------|---------|
| [`autoCrushColumns`](#column-crushing) | `boolean` | `true` |
| [`autoCrushNumCols`](#column-crushing) | `number` | `50` |
| [`crushMinSizeBy`](#column-crushing) | `"header" \| "cell" \| "both"` | `"both"` |
| [`fillAvailableSpaceAfterCrush`](#space-filling) | `boolean` | `true` |
| [`scrollbarWidth`](#space-filling) | `number` | 16 |

### Pinning Behavior

| Prop | Type | Default |
|------|------|---------|
| [`pinColsRelativeTo`](#pinning) | `"cols" \| "table"` | `"cols"` |
| [`pinRowsRelativeTo`](#pinning) | `"rows" \| "table"` | `"rows"` |

### Rendering Controls

| Prop | Type | Default |
|------|------|---------|
| [`renderSubComponent`](#rendering) | `(row: Row) => ReactNode` | — |
| [`underlay`](#rendering) | `ReactNode` | — |
| [`tableRef`](#table-ref) | `RefObject<RttuiRef \| undefined>` | — |
| [`shouldUpdate`](#performance) | `ShouldUpdate` | — |

### Column Meta Options

The following options can be added to column meta in the Tanstack Table instance:

| Option | Type | Default |
|--------|------|---------|
| [`autoCrush`](#column-meta) | `boolean` | `true` |
| [`fillAvailableSpaceAfterCrush`](#column-meta) | `boolean` | `true` |
| [`crushMinSizeBy`](#column-meta) | `"header" \| "cell" \| "both"` | `"header"` |

## Detailed Prop Descriptions

### Core Props

<a id="table"></a>
#### `table`

A Tanstack Table instance that provides the data, columns, and other table configuration.

<a id="dimensions"></a>
#### `width` and `height`

- `width`: Fixed width for the table. Defaults to the sum of all column widths.
- `height`: Fixed height for the table. Defaults to the sum of all row heights.

<a id="skin"></a>
#### `skin`

Custom skin for styling the table. Defaults to the built-in skin from `@rttui/core`.

### Virtualization

<a id="overscan"></a>
#### `rowOverscan` and `columnOverscan`

- `rowOverscan`: Number of rows to render beyond the visible area (default: `1`).
- `columnOverscan`: Number of columns to render beyond the visible area (default: `1`).

These properties improve scrolling performance by pre-rendering rows and columns that are just outside the visible area.

### Column Management

<a id="column-crushing"></a>
#### Column Crushing

- `autoCrushColumns`: When `true`, all columns will be automatically resized to fit their content (default: `false`).
- `autoCrushNumCols`: Maximum number of columns to measure when `autoCrushColumns` is enabled (default: `50`).
- `crushMinSizeBy`: Determines whether minimum column size should be based on the header, cell content, or both (default: `"header"`).

<a id="space-filling"></a>
#### Space Filling

- `fillAvailableSpaceAfterCrush`: When `true`, columns will expand to fill available space after crushing (default: `false`).
- `scrollbarWidth`: When filling available space, this value is used to calculate the correct width accounting for the scrollbar.

<a id="pinning"></a>
#### Pinning Behavior

- `pinColsRelativeTo`: Controls whether pinned columns are positioned relative to the visible columns (`"cols"`) or the table edge (`"table"`). Default: `"cols"`.
- `pinRowsRelativeTo`: Controls whether pinned rows are positioned relative to the visible rows (`"rows"`) or the table edge (`"table"`). Default: `"rows"`.

### Rendering Options

<a id="rendering"></a>
#### Rendering Components

- `renderSubComponent`: Function that returns a React component to be rendered below each row.
- `underlay`: React component to be rendered inside the table container, below the table content.

<a id="table-ref"></a>
#### `tableRef`

Reference to access table measurements and internal state.

```tsx
type RttuiRef = {
  autoSizeColumns: () => void;
};
```

<a id="performance"></a>
#### `shouldUpdate`

Controls when cells/headers should re-render for performance optimization. By default, every cell will be re-rendered on each frame (except during scrolling or column resizing). To improve performance, you can return `false` from this function for cells or headers that haven't changed.

```tsx
import { CellContext, HeaderContext } from '@tanstack/react-table';

type UpdateProps<T extends CellContext<any, any> | HeaderContext<any, any>> = {
  context: {
    prev: T;
    next: T;
  };
  isScrolling: {
    horizontal: boolean;
    vertical: boolean;
  };
  isResizingColumn: string | false;
};

type ShouldUpdate = {
  cell?: (props: UpdateProps<CellContext<any, any>>) => boolean;
  header?: (props: UpdateProps<HeaderContext<any, any>>) => boolean;
};
```

When implementing a `shouldUpdate` function, return `true` if the component should update, or `false` if it should not. This gives you precise control over when cells and headers re-render based on changes to their context, scroll state, or column resizing state. If a column is being resized, `isResizingColumn` will contain the column ID as a string, otherwise it will be `false`.

<a id="column-meta"></a>
### Column Meta Options

These options can be set on individual columns through the column meta property:

- `autoCrush`: Enable/disable auto-crush for specific columns (default: `true`).
- `fillAvailableSpaceAfterCrush`: Enable/disable filling available space for specific columns (default: `true`).
- `crushMinSizeBy`: Column-specific crush size calculation method (default: `"header"`).

## AutoSizer Props Overview

The `AutoSizer` component automatically measures and adjusts the size the ReactTanstackTableUi component based on available container space.

| Prop | Type | Default |
|------|------|---------|
| [`children`](#autosizer-children) | `ReactNode` | — |
| [`style`](#autosizer-style) | `CSSProperties` | — |
| [`adaptTableToContainer`](#autosizer-adapt-table) | `{ width?: boolean, height?: boolean }` | `{ width: true, height: true }` |
| [`adaptContainerToTable`](#autosizer-adapt-container) | `{ width?: boolean, height?: boolean }` | `{ width: false, height: false }` |

<a id="autosizer-children"></a>
#### `children`

React children to render within the AutoSizer. They will receive the measured dimensions.

<a id="autosizer-style"></a>
#### `style`

CSS properties to apply to the container element.

<a id="autosizer-adapt-table"></a>
#### `adaptTableToContainer`

Object that controls whether container dimensions should be passed to the table:

```typescript
{
  width?: boolean;   // default: true - pass container width to table
  height?: boolean;  // default: true - pass container height to table
}
```

<a id="autosizer-adapt-container"></a>
#### `adaptContainerToTable`

Object that controls whether table dimensions should be applied to the container:

```typescript
{
  width?: boolean;   // default: false - resize container to table width
  height?: boolean;  // default: false - resize container to table height
}
```

```tsx
import { AutoSizer, ReactTanstackTableUi } from '@rttui/core';

const table = (
  <ReactTanstackTableUi
    table={table}
    autoCrushColumns
    crushMinSizeBy="both"
    fillAvailableSpaceAfterCrush
    scrollbarWidth={16}
  />
)

// Default: Container dimensions flow down to the table
<AutoSizer>
  {table}
</AutoSizer>

// Fixed width container, height flows down
<AutoSizer 
  adaptTableToContainer={{ width: false, height: true }}
  style={{ width: '400px' }}
>
  {table}
</AutoSizer>

// Table height determines container height
<AutoSizer 
  adaptTableToContainer={{ height: false }}
  adaptContainerToTable={{ height: true }}
>
  {table}
</AutoSizer>
```