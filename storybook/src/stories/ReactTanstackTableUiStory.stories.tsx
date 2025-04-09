import type { Meta, StoryObj } from "@storybook/react";

import { TailwindSkin } from "@rttui/skin-tailwind";
import { getCoreRowModel } from "@tanstack/react-table";
import { ReactTanstackTableUi } from "./ReactTanstackTableUiStoryComponent";
import { createSourceCode } from "./createSourceCode";
import { AnoccaSkin } from "@rttui/skin-anocca";
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
      control: "select",
      options: ["@rttui/skin-anocca", "@rttui/skin-tailwind"],
      description: "The skin to use for the table",
      table: {
        defaultValue: {
          summary: "@rttui/skin-tailwind",
        },
      },
      mapping: {
        "@rttui/skin-anocca": AnoccaSkin,
        "@rttui/skin-tailwind": TailwindSkin,
      },
    },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    width: 600,
    height: 400,
    skin: TailwindSkin,
    autoCrushColumns: false,
    data: "big",
    columns: "few",
    getCoreRowModel: getCoreRowModel(),
    pinColsRelativeTo: "cols",
    fillAvailableSpaceAfterCrush: false,
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
    enableColumnPinning: true,
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
    enableColumnPinning: true,
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
    enableColumnPinning: true,
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

export const FillAvailableSpaceAfterCrushWithTwoHeaderRows: Story = {
  args: {
    autoCrushColumns: true,
    fillAvailableSpaceAfterCrush: true,
    withTwoHeaderRows: true,
  },
};
export const FillAvailableSpaceAfterCrushWithHeaderGroups: Story = {
  args: {
    autoCrushColumns: true,
    fillAvailableSpaceAfterCrush: true,
    withHeaderGroups: true,
  },
};
export const FillAvailableSpaceAfterCrushWithHeaderGroupsExceptName: Story = {
  args: {
    autoCrushColumns: true,
    fillAvailableSpaceAfterCrush: true,
    withHeaderGroups: true,
    meta: {
      name: {
        fillAvailableSpaceAfterCrush: false,
      },
    },
  },
};

export const FillAvailableSpaceAfterCrushWithTwoHeaderRowsExceptName: Story = {
  args: {
    autoCrushColumns: true,
    fillAvailableSpaceAfterCrush: true,
    withTwoHeaderRows: true,
    meta: {
      name: {
        fillAvailableSpaceAfterCrush: false,
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
    crushMinSizeBy: "cell",
  },
};

export const SizeByLargestHeaderWithMeta: Story = {
  args: {
    autoCrushColumns: true,
    crushMinSizeBy: "header",
    enableColumnPinning: true,
    meta: {
      age: {
        crushMinSizeBy: "cell",
      },
    },
  },
};

export const WorksWithoutRows: Story = {
  args: {
    autoCrushColumns: true,
    crushMinSizeBy: "both",
    fillAvailableSpaceAfterCrush: true,
    scrollbarWidth: 0,
    data: "none",
    withHeaderGroups: true,
  },
};

export const StaticTable: Story = {
  args: {
    data: "small",
    columns: "few",
    width: undefined,
    height: undefined,
    crushMinSizeBy: "both",
    autoCrushColumns: true,
    scrollbarWidth: 0,
  },
};

export const MeasureOverscanCols: Story = {
  args: {
    data: "big",
    columns: "many",
    crushMinSizeBy: "cell",
    autoCrushColumns: true,
    autoCrushNumCols: 1000,
  },
};
