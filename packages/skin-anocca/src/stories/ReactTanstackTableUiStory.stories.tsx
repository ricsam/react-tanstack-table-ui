import type { Meta, StoryObj } from "@storybook/react";

import { getCoreRowModel } from "@tanstack/react-table";
import { AnoccaSkin } from "..";
import { ReactTanstackTableUi } from "./ReactTanstackTableUiStoryComponent";
import { createSourceCode } from "./createSourceCode";

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
    skin: {
      control: "object",
      table: { disable: true },
    },
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
    getRowId: (row) => row.id,
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
  parameters: {
    docs: {
      source: { language: "tsx", code: createSourceCode() },
    },
  },
};

export const AutoCrushColumns: Story = {
  args: {
    autoCrushColumns: true,
  },
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: createSourceCode({ props: "  autoCrushColumns" }),
      },
    },
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
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: createSourceCode({
          props: "  autoCrushColumns",
          nameMeta: "    autoCrush: false,",
        }),
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
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: createSourceCode({
          props: "  autoCrushColumns\n  fillAvailableSpaceAfterCrush",
          nameMeta: "    fillAvailableSpaceAfterCrush: false,",
        }),
      },
    },
  },
};

export const FillAvailableSpaceAfterCrushWithoutSpecifiedScrollbarWidth: Story =
  {
    args: {
      autoCrushColumns: true,
      fillAvailableSpaceAfterCrush: true,
      scrollbarWidth: 0,
    },
  };

export const CanPinRowsRelativeToRows: Story = {
  args: {
    enableRowPinning: true,
    enableColumnPinning: true,
    data: "small",
    pinRowsRelativeTo: "rows",
    initialState: {
      rowPinning: {
        bottom: ["3"],
      },
    },
  },
};

export const CanPinRowsRelativeToTable: Story = {
  args: {
    enableRowPinning: true,
    enableColumnPinning: true,
    data: "small",
    pinRowsRelativeTo: "table",
    initialState: {
      rowPinning: {
        bottom: ["3"],
      },
    },
  },
};

export const SizeByLargestHeader: Story = {
  args: {
    autoCrushColumns: true,
    crushMinSizeBy: "header",
    enableColumnPinning: true,
  },
};

export const SizeByLargestHeaderWithMeta: Story = {
  args: {
    autoCrushColumns: true,
    crushMinSizeBy: "header",
    enableColumnPinning: true,
    meta: {
      age: {
        crushMinSizeBy: 'cell',
      },
    },
  },
};
