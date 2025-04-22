# Virtualized Table - MUI Skin

This package provides a Material UI (MUI) styled skin for the `@rttui/core` virtualized table.

## Dependencies

- `@rttui/core`: The core table logic.
- `react` (peer)
- `react-dom` (peer)
- `@mui/material` (peer)
- `@emotion/react` (peer)
- `@emotion/styled` (peer)
- `@mui/icons-material` (peer/dev)

Ensure peer dependencies are installed in your project.

## Setup

```bash
npm install @rttui/skin-mui @rttui/core react react-dom @mui/material @emotion/react @emotion/styled @mui/icons-material
# or
yarn add @rttui/skin-mui @rttui/core react react-dom @mui/material @emotion/react @emotion/styled @mui/icons-material
```

## Usage

Import the `MuiSkin` object and pass it to the `VirtualizedTable` component:

```tsx
import { VirtualizedTable } from '@rttui/core';
import { MuiSkin } from '@rttui/skin-mui';

// ... component setup ...

<VirtualizedTable
  {/* ... other props ... */}
  skin={MuiSkin}
/>
```

## Exported Components

The following components are exported:

- `MuiSkin`: The main skin object to pass to the table.
- `HeaderPinButtons`
- `Checkbox`
- `CellAvatar`
- `CellAvatarWithText`
- `CellNumber`
- `CellTag`
- `CellText`
- `Resizer`
- `ExpandButton`
- `RowPinButtons`
- `CellTextBold`
- `CellCurrency`
- `CellBadge`
- `Cell`
- `CellLink`
- `CellPercent`
