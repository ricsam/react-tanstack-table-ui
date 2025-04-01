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
npm install @rttui/core

# Install a skin (optional)
npm install @rttui/skin-mui
```

## Getting Started

Here's a basic example of how to use React TanStack Table UI:

```tsx
import { createTable, useTable } from '@rttui/core';
import { defaultSkin, lightModeVars } from '@rttui/core';

// Define your data type
type Person = {
  id: number;
  name: string;
  age: number;
  email: string;
};

// Create your table instance
const table = createTable<Person>({
  columns: [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'age',
      header: 'Age',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
  ],
});

// Use the table in your component
function MyTable() {
  const tableInstance = useTable(table, {
    data: [
      { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' },
      // ... more data
    ],
  });

  return (
    <div className="h-[400px] w-full" style={lightModeVars}>
      <Table
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