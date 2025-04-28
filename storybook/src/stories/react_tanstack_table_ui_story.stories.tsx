import type { Meta, StoryObj } from "@storybook/react";

import {
  ColumnDef,
  getCoreRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { ReactNode, useReducer, useState } from "react";
import { createSourceCode } from "./create_source_code";
import {
  Person,
  ReactTanstackTableUi,
} from "./react_tanstack_table_ui_story_component";
import { useSkinParam } from "./use_skin_param";
import { AutoSizer } from "@rttui/core";

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
    },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    width: 600,
    height: 400,
    autoCrushColumns: false,
    data: "big",
    columns: "few",
    getCoreRowModel: getCoreRowModel(),
    pinColsRelativeTo: "cols",
    fillAvailableSpaceAfterCrush: false,
    scrollbarWidth: 16,
    getRowId: (row) => row.id,
  },
  render: function Render(args) {
    const skin = useSkinParam();
    return <ReactTanstackTableUi {...args} skin={skin} />;
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
    columnDefs: {
      name: {
        meta: {
          autoCrush: false,
        },
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
    enableRowSelection: true,
    crushMinSizeBy: "both",
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
    columnDefs: {
      name: {
        meta: {
          fillAvailableSpaceAfterCrush: false,
        },
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
    columnDefs: {
      name: {
        meta: {
          fillAvailableSpaceAfterCrush: false,
        },
      },
    },
  },
};

export const FillAvailableSpaceAfterCrushWithTwoHeaderRowsExceptName: Story = {
  args: {
    autoCrushColumns: true,
    fillAvailableSpaceAfterCrush: true,
    withTwoHeaderRows: true,
    columnDefs: {
      name: {
        meta: {
          fillAvailableSpaceAfterCrush: false,
        },
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
    columnDefs: {
      age: {
        meta: {
          crushMinSizeBy: "cell",
        },
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

export const CanExpandRowsWithMaxWidth: Story = {
  args: {
    data: "big",
    columns: "few",
    autoCrushColumns: true,
    width: 1200,
    fillAvailableSpaceAfterCrush: true,
    columnDefs: {
      name: {
        maxSize: 200,
      },
    },
  },
};

export const CanExpandRowsWithMaxWidthWithHeaderGroups: Story = {
  args: {
    data: "big",
    columns: "few",
    autoCrushColumns: true,
    width: 1200,
    fillAvailableSpaceAfterCrush: true,
    withHeaderGroups: true,
    columnDefs: {
      name: {
        maxSize: 200,
      },
      age: {
        maxSize: 200,
      },
    },
  },
};

export const CanChangeContentOfCell: Story = {
  args: {
    data: "small",
    columns: "few",
    columnDefs: {
      name: {
        header: "Before",
      },
    },
    shouldUpdate: {
      cell: (props) => props.context.prev.cell !== props.context.next.cell,
      header: (props) => props.context.prev.header !== props.context.next.header,
    },
  },
  render: function Render(args) {
    const skin = useSkinParam();
    return <CanChangeContentOfCellComponent {...args} skin={skin} />;
  },
};

function CanChangeContentOfCellComponent(args: Story["args"]) {
  const [value, setValue] = useState<string | null>(null);
  const [, rerender] = useReducer(() => ({}), {});
  const columnDef: Partial<ColumnDef<Person, ReactNode>> | undefined = value
    ? {
        cell: value,
        header: value,
      }
    : args?.columnDefs?.name;
  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-2">
        <button
          className="relative bg-blue-500 text-white p-2 rounded inline-flex cursor-pointer"
          onClick={() => setValue((prev) => (prev ? null : "HELLO"))}
        >
          <span>Toggle Value</span>
          {value && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 h-3 w-3 rounded-full bg-green-500"></span>
          )}
        </button>
        <button
          onClick={() => rerender()}
          className="bg-blue-500 text-white p-2 rounded inline-flex cursor-pointer"
        >
          Rerender
        </button>
      </div>
      <ReactTanstackTableUi
        {...(args as any)}
        columnDefs={{
          name: columnDef,
        }}
      />
    </div>
  );
}

export const FullExample: Story = {
  args: {
    data: "big",
    columns: "many",
    autoCrushColumns: true,
    withHeaderGroups: true,
    enableColumnPinning: true,
    enableRowPinning: true,
    scrollbarWidth: 16,
    crushMinSizeBy: "both",
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    width: 1200,
    height: 600,
    enableRowSelection: true,
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    renderSubComponent(row) {
      return <div className="p-4 bg-gray-100">{row.original.name}</div>;
    },
  },
};

export const AutoSizerExample: Story = {
  args: {
    data: "big",
    columns: "many",
    width: undefined,
    height: undefined,
  },
  render: function Render(args) {
    const skin = useSkinParam();
    return (
      <div style={{ width: "50vw", height: "50vh", display: "flex" }}>
        <AutoSizer style={{ flex: 1, width: "100%", height: "100%" }}>
          <ReactTanstackTableUi {...args} skin={skin} />
        </AutoSizer>
      </div>
    );
  },
};
