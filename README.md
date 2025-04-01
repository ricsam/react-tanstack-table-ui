# React TanStack Table UI

A collection of components and utilities for building powerful, customizable tables with TanStack Table and virtual scrolling support.

## Features

- 🚀 Based on [TanStack Table](https://tanstack.com/table) (formerly React Table v8)
- 📜 Virtual scrolling support via [TanStack Virtual](https://tanstack.com/virtual)
- 🎨 Multiple skins (Material UI, Anocca, and more)
- 🔌 Extensible architecture for custom skins
- 📦 Modular packages for flexible integration

## Quick Start

```bash
# Install core package
npm install @rttui/core @tanstack/react-table
```

## Getting Started

Here's a basic example of how to use React TanStack Table UI:

```tsx
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { defaultSkin, lightModeVars, ReactTanstackTableUi } from '@rttui/core';

type Person = {
  firstName: string
  lastName: string
  age: number
  visits: number
  status: string
  progress: number
}

const defaultData: Person[] = [
  {
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
  },
  {
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
]

const columnHelper = createColumnHelper<Person>()

const columns = [
  columnHelper.accessor('firstName', {
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor(row => row.lastName, {
    id: 'lastName',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Last Name</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor('age', {
    header: () => 'Age',
    cell: info => info.renderValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('visits', {
    header: () => <span>Visits</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    footer: info => info.column.id,
  }),
  columnHelper.accessor('progress', {
    header: 'Profile Progress',
    footer: info => info.column.id,
  }),
]

// Use the table in your component
function MyTable() {
  const [data, _setData] = React.useState(() => [...defaultData])
  const rerender = React.useReducer(() => ({}), {})[1]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })


  return (
    <div className="h-[400px] w-full" style={lightModeVars}>
      <ReactTanstackTableUi
        table={tableInstance}
        width={800}
        height={400}
        skin={defaultSkin}
      />
    </div>
  );
}
```

For more advanced features like:
- Virtual scrolling with large datasets
- Custom skins and theming
- Drag and drop functionality
- Column resizing and reordering

Check out our [documentation](https://rttui-docs.vercel.app) and [examples](https://stackblitz.com/github/ricsam/virtualized-table/tree/main/examples/full).

## Documentation

Visit our [documentation site](https://rttui-docs.vercel.app) for comprehensive guides, examples, and API references.

## Examples

Try our interactive examples:

- [Full Example](https://stackblitz.com/github/ricsam/virtualized-table/tree/main/examples/full?embed=1&theme=dark&preset=node&file=src/app.tsx)
- [Codesandbox](https://codesandbox.io/p/devbox/github/ricsam/virtualized-table/tree/main/examples/full?embed=1&theme=dark&file=src/app.tsx)

## Repository Structure

### Packages

- `core`: Core functionality and base components
- `skin-mui`: Material UI implementation
- `skin-anocca`: Anocca-themed components
- `fixtures`: Test fixtures and utilities
- `docs`: Documentation website

### Examples

Example projects demonstrating various use cases:

- `full`: Complete example with all features
- `minimal`: Minimal setup example
- `skins`: Examples of different visual themes

### Scripts

- `link_lib_to_examples.ts`: Development utility to link local packages to examples

## Contributing

Contributions are welcome! Please check the [contributing guidelines](CONTRIBUTING.md) for more information.

## License

MIT