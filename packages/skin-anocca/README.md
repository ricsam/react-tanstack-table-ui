# Virtualized Table - Anocca Skin

This package provides an Anocca-styled skin for the `@rttui/core` virtualized table.

## Dependencies

- `@rttui/core`: The core table logic.
- `react` (peer)
- `react-dom` (peer)
- `@emotion/react` (peer/dev)
- `@emotion/styled` (peer/dev)
- `@mui/material` (peer/dev - Check if truly needed or leftover)
- `react-icons` (peer/dev)

Ensure peer dependencies are installed in your project.

## Setup

```bash
npm install @rttui/skin-anocca @rttui/core react react-dom @emotion/react @emotion/styled react-icons
# or
yarn add @rttui/skin-anocca @rttui/core react react-dom @emotion/react @emotion/styled react-icons
```

## Usage

Import the `AnoccaSkin` object and pass it to the `VirtualizedTable` component:

```tsx
import { VirtualizedTable } from '@rttui/core';
import { AnoccaSkin } from '@rttui/skin-anocca';

// ... component setup ...

<VirtualizedTable
  {/* ... other props ... */}
  skin={AnoccaSkin}
/>
```

## Exported Components

The following components are exported:

- `AnoccaSkin`: The main skin object to pass to the table.
- `TableHeaderRow`
- `HeaderPinButtons`
- `RowPinButtons`
- `Resizer`
- `CellAvatar`
- `CellAvatarWithText`
- `CellNumber`
- `CellTag`
- `CellText`
- `ExpandButton`
- `Checkbox`
- `CellTextBold`
- `CellCurrency`
- `CellBadge`
- `Cell`
- `CellLink`
- `CellPercent`
