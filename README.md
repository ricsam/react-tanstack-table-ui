# React TanStack Table UI

A collection of components and utilities for building powerful, customizable tables with TanStack Table and virtual scrolling support.

## Features

- 📜 Based on [TanStack Table](https://tanstack.com/table) and aims to implement UI support for all the TanStack Table features
- 🚀 Made for a lot of data
- 🎨 Multiple skins (Material UI, Tailwind, and more)
- 🔌 Extensible architecture for custom skins

Check out a demo on https://rttui-docs.vercel.app/#live-demo

# Getting Started

This guide will help you get started with React TanStack Table UI. Follow these steps to
install and set up the library in your React project.

## Installation

You can install React TanStack Table UI:

```bash
npm i @rttui/core @tanstack/react-table@8
```

Additionally, you might want to install one of the available
[skins](https://rttui-docs.vercel.app/skins). Please read the guide for the skin you would like to use:

```bash
# Material UI skin
npm i @rttui/skin-mui @mui/material @emotion/react @emotion/styled @mui/icons-material

# Tailwind skin
npm i @rttui/skin-tailwind
```

## Basic Setup

Here's a simple example of how to use React TanStack Table UI with the core package, or view it <a href="https://codesandbox.io/p/sandbox/3z6hjf?file=%2Fsrc%2FMyTable.tsx" target="_blank" rel="noopener noreferrer">on codesandbox</a>:

```tsx
import { ReactTanstackTableUi, lightModeVars } from "@rttui/core";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const data: Person[] = [
  {
    firstName: "tanner",
    lastName: "linsley",
    age: 24,
    visits: 100,
    status: "In Relationship",
    progress: 50,
  },
  {
    firstName: "tandy",
    lastName: "miller",
    age: 40,
    visits: 40,
    status: "Single",
    progress: 80,
  },
  {
    firstName: "joe",
    lastName: "dirte",
    age: 45,
    visits: 20,
    status: "Complicated",
    progress: 10,
  },
];

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor("firstName", {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor((row) => row.lastName, {
    id: "lastName",
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Last Name</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("age", {
    header: () => "Age",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("visits", {
    header: () => <span>Visits</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("progress", {
    header: "Profile Progress",
    footer: (info) => info.column.id,
  }),
];

function MyTable() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={lightModeVars}>
      <ReactTanstackTableUi table={table} />
    </div>
  );
}

export default MyTable;
```

## Table sizing

By default the width of the table will the aggregated width of the columns and the height will be the aggregated height of the rows. Either set a fixed width and height to make
the table scroll or use a component to automatically measure the space available. For example:

```tsx
import useMeasure from "react-use-measure";

const [ref, { width, height }] = useMeasure();

<>
  // Create a wrapper that is dynamically sized and position relative
  <div style={{ position: "relative", flex: 1, ...lightModeVars }}>
    {/*
    Create an inner element that will be position absolute to mirror the size of
    the wrapper. This is the element that is measured. It is important that this
    element is position absolute so it doesn't change the size of the wrapper
    after measuring which could cause an infinite measure-resize-measure-resize
    loop
    */}
    <div style={{ position: "absolute", inset: 0 }} ref={ref}>
      {width && height && (
        <ReactTanstackTableUi table={table} width={width} height={height} />
      )}
    </div>
  </div>
</>;
```

or you can import an autosizer from the `@rttui/core`, which does the above more or less, so you don't have to install more dependencies:

```tsx
import { AutoSizer } from "@rttui/core";

<AutoSizer style={{ flex: 1, ...lightModeVars }}>
  <ReactTanstackTableUi table={table} />
</AutoSizer>;
```

The `<AutoSizer />` component will create a context to provide the width and height to the `<ReactTanstackTableUi />` component.

## Next Steps

Now that you have a basic table set up, you can explore the following topics:

- Explore [the examples](https://rttui-docs.vercel.app/examples)
- Discover [different skins](https://rttui-docs.vercel.app/skins)

Check out the complete [API reference](https://rttui-docs.vercel.app/docs/api) for detailed documentation on all components and options.

## License

MIT