import type { Meta, StoryObj } from "@storybook/react";

import { Box } from "@mui/material";
import { decorateColumnHelper } from "@rttui/core";
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table";
import { AnoccaSkin } from "..";
import { HeaderPinButtons } from "../HeaderPinButtons";
import { ReactTanstackTableUi } from "./ReactTanstackTableUiStoryComponent";

type Person = {
  id: string;
  name: string;
  age: number;
  city: string;
} & Record<`col${number}`, string>;

const data: Person[] = [
  { id: "1", name: "John", age: 20, city: "New York" },
  { id: "2", name: "Jane", age: 21, city: "Los Angeles" },
  { id: "3", name: "Jim", age: 22, city: "Chicago" },
];

const bigData: Person[] = Array.from({ length: 1000 }, (_, i) => ({
  id: i.toString(),
  name: `Person ${i}`,
  age: 20 + i,
  city: `City ${i}`,
  ...Object.fromEntries(
    Array.from({ length: 100 }, (_, j) => [`col${j}`, `Value ${i}-${j}`]),
  ),
}));

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
    tableOptions: { control: "object" },
    uiOptions: { control: "object" },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    uiOptions: {
      width: 600,
      height: 400,
      skin: AnoccaSkin,
      autoSizeColumns: true,
    },
    tableOptions: {
      columns: [],
      data: [],
      getCoreRowModel: getCoreRowModel(),
    },
  },
} satisfies Meta<typeof ReactTanstackTableUi>;

export default meta;
type Story = StoryObj<typeof meta>;

const columnHelper = decorateColumnHelper(createColumnHelper<Person>(), {
  header: (original) => (
    <Box sx={{ display: "flex", gap: 2 }}>
      {original}
      <HeaderPinButtons />
    </Box>
  ),
});

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("age", {
    header: "Age",
  }),
  columnHelper.accessor("city", {
    header: "City",
  }),
];

const manyColumns = [
  ...columns,
  ...Array.from({ length: 100 }, (_, i) =>
    columnHelper.accessor(`col${i}`, {
      header: `Column ${i}`,
      cell: (info) => info.getValue(),
    }),
  ),
];

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const AutoSizeColumns: Story = {
  args: {
    tableOptions: {
      columns,
      data,
      getCoreRowModel: getCoreRowModel(),
      enableColumnResizing: true,
      enableColumnPinning: true,
    },
    uiOptions: {
      width: 600,
      height: 400,
      skin: AnoccaSkin,
      autoSizeColumns: true,
    },
  },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const AutoSizeColumnsPinRelativeToCols: Story = {
  args: {
    tableOptions: {
      columns,
      data,
      getCoreRowModel: getCoreRowModel(),
      enableColumnResizing: true,
      enableColumnPinning: true,
    },
    uiOptions: {
      width: 600,
      height: 400,
      skin: AnoccaSkin,
      autoSizeColumns: true,
      pinColsRelativeTo: "cols",
    },
  },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const PinRelativeToCols: Story = {
  args: {
    tableOptions: {
      columns,
      data,
      getCoreRowModel: getCoreRowModel(),
      enableColumnResizing: true,
      enableColumnPinning: true,
      initialState: {
        columnPinning: {
          right: ["city"],
        },
      },
    },
    uiOptions: {
      width: 600,
      height: 400,
      skin: AnoccaSkin,
    },
  },
};

export const PinRelativeToTable: Story = {
  args: {
    tableOptions: {
      columns,
      data,
      getCoreRowModel: getCoreRowModel(),
      enableColumnResizing: true,
      enableColumnPinning: true,
      initialState: {
        columnPinning: {
          right: ["city"],
        },
      },
    },
    uiOptions: {
      width: 600,
      height: 400,
      skin: AnoccaSkin,
      pinColsRelativeTo: "table",
    },
  },
};

export const PinRelativeToTableWithBigData: Story = {
  args: {
    tableOptions: {
      columns: manyColumns,
      data: bigData,
      getCoreRowModel: getCoreRowModel(),
      enableColumnResizing: true,
      enableColumnPinning: true,
      initialState: {
        columnPinning: {
          right: ["city"],
        },
      },
    },
    uiOptions: {
      width: 600,
      height: 400,
      skin: AnoccaSkin,
      pinColsRelativeTo: "table",
    },
  },
};
