import { CodeBlock } from "../../components/CodeBlock";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import { ReactTanstackTableUi } from "@rttui/core";
import {
  CellText,
  CellCode,
  TailwindSkin,
  lightModeVars,
  darkModeVars,
} from "@rttui/skin-tailwind";
import useMeasure from "react-use-measure";
import { useTheme } from "@/contexts/use_theme";

type Prop = {
  id: string;
  name: string;
  type: string;
  description: string;
  required: boolean;
};

const data: Prop[] = [
  {
    id: "1",
    name: "table",
    type: "Table&lt;T&gt;",
    description: "TanStack table instance",
    required: true,
  },
  {
    id: "2",
    name: "width",
    type: "number",
    description: "Width of the table in pixels",
    required: true,
  },
  {
    id: "3",
    name: "height",
    type: "number",
    description: "Height of the table in pixels",
    required: true,
  },
  {
    id: "4",
    name: "rowOverscan",
    type: "number",
    description:
      "Number of rows to render outside of the visible area (default: 10)",
    required: false,
  },
  {
    id: "5",
    name: "columnOverscan",
    type: "number",
    description:
      "Number of columns to render outside of the visible area (default: 3)",
    required: false,
  },
  {
    id: "6",
    name: "skin",
    type: "Skin",
    description: "Custom skin for styling the table (default: defaultSkin)",
    required: false,
  },
  {
    id: "7",
    name: "rowDndHandler",
    type: "RowDndHandler&lt;T&gt;",
    description: "Handler for row drag-and-drop functionality",
    required: false,
  },
  {
    id: "8",
    name: "colDndHandler",
    type: "ColDndHandler&lt;T&gt;",
    description: "Handler for column drag-and-drop functionality",
    required: false,
  },
  {
    id: "9",
    name: "autoSizeColumns",
    type: "boolean",
    description: "Whether to automatically size the columns",
    required: false,
  },
  {
    id: "10",
    name: "underlay",
    type: "React.ReactNode",
    description: "Custom underlay for the table",
    required: false,
  },
  {
    id: "11",
    name: "renderSubComponent",
    type: "(args: { row: Row<T> }) => React.ReactNode",
    description: "Render a sub-component for each row",
    required: false,
  },
];

const columnHelper = createColumnHelper<Prop>();
const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (props) => {
      return <CellText>{props.getValue()}</CellText>;
    },
  }),
  columnHelper.accessor("type", {
    header: "Type",
    cell: (props) => {
      return <CellCode code={props.getValue()} />;
    },
  }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: (props) => {
      return <CellText>{props.getValue()}</CellText>;
    },
  }),
  columnHelper.accessor("required", {
    header: "Required",
    cell: (props) => {
      return <CellText>{props.getValue() ? "Yes" : "No"}</CellText>;
    },
    meta: {
      autoSize: false,
    },
  }),
];

export function OptionsPage() {
  const customHeaderExample = `import React from 'react';
import { ReactTanstackTableUi, useVirtualHeader } from '@rttui/core';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

function CustomHeaderTable() {
  // Sample data and columns
  const data = [...]; // Your data array
  const columns = [...]; // Your column definitions
  
  // Create a table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  // Custom header renderer
  const CustomHeader = ({ header }) => {
    // Use the useVirtualHeader hook to get header styling and properties
    const virtualHeader = useVirtualHeader(header);
    
    return (
      <div 
        style={{
          ...virtualHeader.dndStyle,
          width: virtualHeader.width,
          padding: '8px',
          fontWeight: 'bold',
          backgroundColor: virtualHeader.isPinned ? '#f0f9ff' : '#f9fafb',
          borderBottom: '2px solid #e5e7eb',
          cursor: 'pointer',
        }}
      >
        {header.column.columnDef.header}
        {/* Add sorting indicators or other UI elements */}
      </div>
    );
  };
  
  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ReactTanstackTableUi
        table={table}
        width={800}
        height={400}
        skin={{
          ...defaultSkin,
          HeaderCell: CustomHeader,
        }}
      />
    </div>
  );
}

export default CustomHeaderTable;`;

  const muiSkinExample = `import React from 'react';
import { muiSkin } from '@rttui/skin-mui';
import { ReactTanstackTableUi } from '@rttui/core';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

function MyMuiTable() {
  // Create your table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ReactTanstackTableUi
        table={table}
        width={800}
        height={400}
        skin={muiSkin}
      />
    </div>
  );
}`;

  const anoccaSkinExample = `import React from 'react';
import { anoccaSkin } from '@rttui/skin-anocca';
import { ReactTanstackTableUi } from '@rttui/core';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

function MyAnoccaTable() {
  // Create your table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ReactTanstackTableUi
        table={table}
        width={800}
        height={400}
        skin={anoccaSkin}
      />
    </div>
  );
}`;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    enableColumnPinning: true,
  });

  const [wrapperRef, wrapperBounds] = useMeasure();

  const { theme } = useTheme();
  const themeVars = theme === "light" ? lightModeVars : darkModeVars;

  return (
    <div className="prose max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1>Options</h1>

      <p>
        The <code>{"<ReactTanstackTableUi />"}</code> component accepts several
        props to customize its behavior:
      </p>

      <div className="w-full aspect-video relative" style={themeVars}>
        <div ref={wrapperRef} className="absolute inset-0">
          {wrapperBounds.width && wrapperBounds.height && (
            <ReactTanstackTableUi
              table={table}
              width={wrapperBounds.width}
              height={wrapperBounds.height}
              skin={TailwindSkin}
              autoSizeColumns
            />
          )}
        </div>
      </div>

      {/* <table>
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Description</th>
            <th>Required</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>table</code>
            </td>
            <td>
              <code>Table&lt;T&gt;</code>
            </td>
            <td>TanStack table instance</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>
              <code>width</code>
            </td>
            <td>
              <code>number</code>
            </td>
            <td>Width of the table in pixels</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>
              <code>height</code>
            </td>
            <td>
              <code>number</code>
            </td>
            <td>Height of the table in pixels</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>
              <code>rowOverscan</code>
            </td>
            <td>
              <code>number</code>
            </td>
            <td>
              Number of rows to render outside of the visible area (default:{" "}
              <code>10</code>)
            </td>
            <td>No</td>
          </tr>
          <tr>
            <td>
              <code>columnOverscan</code>
            </td>
            <td>
              <code>number</code>
            </td>
            <td>
              Number of columns to render outside of the visible area (default:{" "}
              <code>3</code>)
            </td>
            <td>No</td>
          </tr>
          <tr>
            <td>
              <code>skin</code>
            </td>
            <td>
              <code>Skin</code>
            </td>
            <td>
              Custom skin for styling the table (default:{" "}
              <code>defaultSkin</code>)
            </td>
            <td>No</td>
          </tr>
          <tr>
            <td>
              <code>rowDndHandler</code>
            </td>
            <td>
              <code>RowDndHandler&lt;T&gt;</code>
            </td>
            <td>Handler for row drag-and-drop functionality</td>
            <td>No</td>
          </tr>
          <tr>
            <td>
              <code>colDndHandler</code>
            </td>
            <td>
              <code>ColDndHandler&lt;T&gt;</code>
            </td>
            <td>Handler for column drag-and-drop functionality</td>
            <td>No</td>
          </tr>
        </tbody>
      </table> */}

      <h2>
        Styling Headers with <code>useVirtualHeader</code>
      </h2>

      <p>
        If you need to customize the appearance of table headers, especially
        when using virtualization, you can use the <code>useVirtualHeader</code>{" "}
        hook:
      </p>

      <CodeBlock
        code={customHeaderExample}
        language="tsx"
        className="bg-gray-800 text-white p-4"
      />

      <h3>
        Properties available in <code>useVirtualHeader</code>
      </h3>

      <p>
        The <code>useVirtualHeader</code> hook provides these properties:
      </p>

      <ul>
        <li>
          <code>type</code>: Either "header" or "footer"
        </li>
        <li>
          <code>isDragging</code>: Whether the header is currently being dragged
        </li>
        <li>
          <code>isPinned</code>: Whether the header is pinned (and to which
          side)
        </li>
        <li>
          <code>width</code>: The width of the header cell
        </li>
        <li>
          <code>dndStyle</code>: CSS styles for drag-and-drop functionality
        </li>
        <li>
          <code>headerId</code>: Unique identifier for the header
        </li>
        <li>
          <code>headerIndex</code>: Index of the header in the column array
        </li>
        <li>
          <code>header</code>: Reference to the original header object
        </li>
      </ul>

      <h2>Using with Skins</h2>

      <p>
        If you've installed one of our skin packages, you can use their
        components instead of the core component:
      </p>

      <h3>Material UI Skin</h3>

      <CodeBlock
        code={muiSkinExample}
        language="tsx"
        className="bg-gray-800 text-white p-4"
      />

      <h3>Anocca Skin</h3>

      <CodeBlock
        code={anoccaSkinExample}
        language="tsx"
        className="bg-gray-800 text-white p-4"
      />

      <h2>Next Steps</h2>

      <p>Now that you're familiar with the basics, you can:</p>

      <ul>
        <li>
          Check out our{" "}
          <a
            href="/examples"
            className="text-primary-600 hover:text-primary-700"
          >
            Examples
          </a>{" "}
          for more advanced usage scenarios
        </li>
        <li>
          Read the{" "}
          <a href="/api" className="text-primary-600 hover:text-primary-700">
            API Reference
          </a>{" "}
          for detailed documentation of all components and options
        </li>
        <li>
          Learn about{" "}
          <a
            href="/docs/concepts/virtualization"
            className="text-primary-600 hover:text-primary-700"
          >
            Virtualization
          </a>{" "}
          techniques for large datasets
        </li>
      </ul>
    </div>
  );
}
