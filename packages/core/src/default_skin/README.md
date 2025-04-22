# Virtualized Table - Default Skin

This package provides the default, unstyled skin components for the `@rttui/core` virtualized table. It serves as a structural base and can be used directly or as a template for creating custom skins.

## Dependencies

This skin is part of the `@rttui/core` package. Its dependencies are managed within the core package's `package.json`. Key peer dependencies typically include:

- `react`
- `react-dom`
- `@tanstack/react-table`
- `@tanstack/react-virtual`

Ensure these are installed in your project.

## Setup

Since this skin is part of the core package, you install it by installing the core:

```bash
npm install @rttui/core
# or
yarn add @rttui/core
```

## Usage

The primary export for using the skin is the `defaultSkin` object from `@rttui/core`:

```tsx
import { VirtualizedTable } from '@rttui/core';
import { defaultSkin } from '@rttui/core'; // Import the skin object

// ... component setup ...

<VirtualizedTable
  {/* ... other props ... */}
  skin={defaultSkin}
/>
```

## Exported Component Files

The following component files are exported from `./index.ts` primarily for potential direct use or extension, though using the `defaultSkin` object is the standard approach:

- `HeaderPinButtons`
- `Checkbox`
- `HeaderCell`
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
