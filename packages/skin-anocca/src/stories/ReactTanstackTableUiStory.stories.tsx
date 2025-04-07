import type { Meta, StoryObj } from "@storybook/react";

import { getCoreRowModel } from "@tanstack/react-table";
import { AnoccaSkin } from "..";
import { ReactTanstackTableUi } from "./ReactTanstackTableUiStoryComponent";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "ReactTanstackTableUi",
  component: ReactTanstackTableUi,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    data: { control: "select" },
    columns: { control: "select" },
    pinColsRelativeTo: { control: "select", options: ["cols", "table"] },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    width: 600,
    height: 400,
    skin: AnoccaSkin,
    autoCrushColumns: false,
    data: "big",
    columns: "few",
    getCoreRowModel: getCoreRowModel(),
    pinColsRelativeTo: "cols",
    fillAvailableSpaceAfterCrush: false,
    enableColumnPinning: true,
    scrollbarWidth: 16,
  },
} satisfies Meta<typeof ReactTanstackTableUi>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    enableColumnPinning: true,
    autoCrushColumns: false,
    fillAvailableSpaceAfterCrush: false,
    pinColsRelativeTo: "cols",
  },
};

export const AutoCrushColumns: Story = {
  args: {
    autoCrushColumns: true,
  },
};

export const AutoCrushColumnsExceptName: Story = {
  args: {
    autoCrushColumns: true,
    meta: {
      name: {
        autoCrush: false,
      },
    },
  },
};

export const PinRelativeToCols: Story = {
  args: {
    autoCrushColumns: true,
    pinColsRelativeTo: "cols",
    initialState: {
      columnPinning: {
        right: ["city"],
      },
    },
  },
};

export const PinRelativeToTable: Story = {
  args: {
    autoCrushColumns: true,
    pinColsRelativeTo: "table",
    initialState: {
      columnPinning: {
        right: ["city"],
      },
    },
  },
};

export const FillAvailableSpaceAfterCrush: Story = {
  args: {
    autoCrushColumns: true,
    fillAvailableSpaceAfterCrush: true,
  },
};

export const FillAvailableSpaceAfterCrushExceptName: Story = {
  args: {
    autoCrushColumns: true,
    fillAvailableSpaceAfterCrush: true,
    meta: {
      name: {
        fillAvailableSpaceAfterCrush: false,
      },
    },
  },
};

export const FillAvailableSpaceAfterCrushWithoutSpecifiedScrollbarWidth: Story = {
  args: {
    autoCrushColumns: true,
    fillAvailableSpaceAfterCrush: true,
    scrollbarWidth: 0,
  },
};
