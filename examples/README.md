# Examples

This directory contains example applications that demonstrate how to use the React TanStack Table UI components in various scenarios.

## Available Examples

### Full Example (`examples/full`)

A comprehensive example showcasing all features of the React TanStack Table UI:

- Column resizing, sorting, and filtering
- Virtual scrolling for large datasets
- Row selection and expansion
- Custom cell rendering
- Advanced filtering capabilities

[Try on StackBlitz](https://stackblitz.com/github/ricsam/react-tanstack-table-ui/tree/main/examples/full?embed=1&theme=dark&preset=node&file=src/app.tsx)

### Minimal Example (`examples/minimal`)

A minimal setup demonstrating the core functionality with minimal configuration:

- Basic table setup
- Essential features only
- Good starting point for beginners

### Spreadsheet Example (`examples/spreadsheet`)

The **Spreadsheet Example** (`examples/spreadsheet`) demonstrates a feature-rich spreadsheet interface powered by React TanStack Table UI, with realtime selection, formula evaluation, and advanced editing.

#### Key Features

- Spreadsheet-like grid with editable cells
- Multi-range selection, copy/paste, and fill handle support
- Formula parsing and live calculation (try typing `=A1+B1` in a cell)
- Row and column pinning, resizing, and sorting
- Seamless Material-UI and Bleu skin integration
- Efficient performance with virtualized rendering

#### Try It Live
Interact with the full spreadsheet UI:  
[Open Spreadsheet Example on StackBlitz](https://stackblitz.com/github/ricsam/react-tanstack-table-ui/tree/main/examples/spreadsheet?embed=1&theme=dark&preset=node&file=src/app.tsx)

#### Notable Implementation Highlights
- Uses `@ricsam/formula-engine` for formula logic and cell dependencies.
- Utilizes `@ricsam/selection-manager` for robust selection and cell-editing UX.
- Integrates custom toolbar, row/column headers, and keyboard navigation.
- Demo data, custom cell rendering, and hooks are all in `src/app.tsx`.

Feel free to explore and adapt the example for your own spreadsheet/editor use cases!


### Skins Example (`examples/skins`)

Examples demonstrating the various skin options:

- Material UI skin
- Bleu skin
- Customization options for each skin

## Running Examples Locally

To run any example locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Link the local packages (for development):
   ```bash
   # From the root directory
   node scripts/link_lib_to_examples.ts
   ```
4. Navigate to the example directory:
   ```bash
   cd examples/[example-name]
   ```
5. Start the development server:
   ```bash
   pnpm dev
   ```

## Note on Dependencies

The examples use fixed dependencies to ensure they work reliably in online sandboxes like StackBlitz and CodeSandbox. The `tsconfig.json` and `package.json` files in each example are configured specifically for these environments. 