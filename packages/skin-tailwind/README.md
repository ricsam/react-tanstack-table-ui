# Virtualized Table - Tailwind Skin

This package provides a Tailwind CSS styled skin for the `@rttui/core` virtualized table.

## Dependencies

- `@rttui/core`: The core table logic.
- `react` (peer)
- `react-dom` (peer)
- `tailwindcss` (peer - required in your project for styles to apply)

Ensure peer dependencies are installed and Tailwind CSS is configured in your project.

## Setup

```bash
npm install @rttui/skin-tailwind @rttui/core react react-dom tailwindcss
# or
yarn add @rttui/skin-tailwind @rttui/core react react-dom tailwindcss
```

Make sure your `tailwind.config.js` includes the components from this package in its `content` array:

```js
// tailwind.config.js
module.exports = {
  content: [
    // ... other paths ...
    './node_modules/@rttui/skin-tailwind/src/**/*.{js,ts,jsx,tsx}',
  ],
  // ... other config ...
};
```

## Usage

Import the `TailwindSkin` object and pass it to the `VirtualizedTable` component:

```tsx
import { VirtualizedTable } from '@rttui/core';
import { TailwindSkin } from '@rttui/skin-tailwind';

// ... component setup ...

<VirtualizedTable
  {/* ... other props ... */}
  skin={TailwindSkin}
/>
```

## Exported Components

The following components are exported:

- `TailwindSkin`: The main skin object to pass to the table.
- `CellAvatar`
- `CellAvatarWithText`
- `CellNumber`
- `CellTag`
- `CellText`
- `Resizer`
- `HeaderPinButtons`
- `ExpandButton`
- `RowPinButtons`
- `Checkbox`
- `CellTextBold`
- `CellCurrency`
- `CellBadge`
- `Cell`
- `CellLink`
- `CellPercent`
- `darkModeVars`: CSS variable definitions for dark mode.
- `lightModeVars`: CSS variable definitions for light mode.

</rewritten_file> 