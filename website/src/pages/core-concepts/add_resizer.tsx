import { CodeBlock } from "@/components/code_block";

export function AddResizerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
      <h1>Adding Resizers</h1>
      <p>
        Column resizing allows users to adjust column widths to better fit the data they're viewing.
        React TanStack Table UI provides built-in support for resizable columns with customizable resizer elements.
      </p>

      <h2>Basic Setup</h2>
      <p>
        To enable column resizing in your table, you need to configure it with the appropriate options:
      </p>

      <CodeBlock language="tsx">
{`import { VirtualizedTable } from '@rttui/core';

function ResizableColumnsTable() {
  return (
    <VirtualizedTable
      columns={columns}
      data={data}
      enableColumnResizing={true}
      // Additional options (optional)
      defaultColumnWidth={150}
      // Other props...
    />
  );
}`}
      </CodeBlock>

      <h2>Column-specific Resizing</h2>
      <p>
        You can configure resizing behavior for individual columns:
      </p>

      <CodeBlock language="tsx">
{`import { createColumnHelper } from '@rttui/core';

const columnHelper = createColumnHelper<Person>();

const columns = [
  // Fixed-width column (not resizable)
  columnHelper.accessor('id', {
    header: 'ID',
    size: 80,
    enableResizing: false,
  }),
  
  // Resizable column with minimum width
  columnHelper.accessor('firstName', {
    header: 'First Name',
    enableResizing: true,
    minSize: 100,
    maxSize: 300,
  }),
  
  // Resizable column with default width
  columnHelper.accessor('lastName', {
    header: 'Last Name',
    size: 150, // Initial width
    enableResizing: true,
  }),
  
  // Other columns...
];`}
      </CodeBlock>

      <h2>Custom Resizer UI</h2>
      <p>
        You can customize the appearance of the resizer handle:
      </p>

      <CodeBlock language="tsx">
{`import { VirtualizedTable } from '@rttui/core';

// Define a custom resizer component
function CustomResizer({ column, onMouseDown, onTouchStart }) {
  return (
    <div
      className={\`
        w-2 h-full cursor-col-resize select-none touch-none
        flex items-center justify-center
        absolute right-0 top-0 bottom-0 z-10
        hover:bg-blue-500 hover:opacity-50
        \${column.getIsResizing() ? 'bg-blue-500 opacity-50' : 'bg-gray-300 opacity-20'}
      \`}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div className="w-px h-4/6 bg-current" />
    </div>
  );
}

function TableWithCustomResizers() {
  return (
    <VirtualizedTable
      columns={columns}
      data={data}
      enableColumnResizing={true}
      // Use your custom resizer component
      resizerComponent={CustomResizer}
    />
  );
}`}
      </CodeBlock>

      <h2>Handling Resize Events</h2>
      <p>
        You can respond to column resize events to perform additional actions:
      </p>

      <CodeBlock language="tsx">
{`import { useState } from 'react';
import { VirtualizedTable } from '@rttui/core';

function ResizeEventHandlingTable() {
  const [columnSizes, setColumnSizes] = useState({});
  const [resizingColumn, setResizingColumn] = useState(null);
  
  // Handle column resize events
  const handleColumnResize = (newColumnSizes) => {
    setColumnSizes(newColumnSizes);
    
    // Optional: Save column sizes to localStorage
    localStorage.setItem('columnSizes', JSON.stringify(newColumnSizes));
    
    // Optional: Log the change
    console.log('Column sizes updated:', newColumnSizes);
  };
  
  // Track when resizing starts and ends
  const handleColumnResizeStart = (column) => {
    setResizingColumn(column.id);
    console.log('Started resizing column:', column.id);
  };
  
  const handleColumnResizeEnd = (column) => {
    setResizingColumn(null);
    console.log('Finished resizing column:', column.id);
  };
  
  return (
    <div>
      {/* Optional: Display resizing information */}
      {resizingColumn && (
        <div className="mb-2 p-2 bg-blue-100 rounded">
          Resizing column: {resizingColumn}
        </div>
      )}
      
      <VirtualizedTable
        columns={columns}
        data={data}
        enableColumnResizing={true}
        columnResizeMode="onChange" // or "onEnd"
        onColumnSizesChange={handleColumnResize}
        onColumnResizeStart={handleColumnResizeStart}
        onColumnResizeEnd={handleColumnResizeEnd}
        // Optional: Restore saved column sizes
        defaultColumnSizes={columnSizes}
      />
      
      {/* Optional: Display current column sizes */}
      <div className="mt-4">
        <h3>Current Column Sizes</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm">
          {JSON.stringify(columnSizes, null, 2)}
        </pre>
      </div>
    </div>
  );
}`}
      </CodeBlock>

      <h2>Resize Modes</h2>
      <p>
        You can choose between different resizing modes to control when resizing changes are applied:
      </p>

      <CodeBlock language="tsx">
{`// Choose a resize mode based on your UX preference
<VirtualizedTable
  enableColumnResizing={true}
  
  // "onChange" applies changes continuously as the user drags
  columnResizeMode="onChange"
  
  // Or "onEnd" applies changes only when the user releases the mouse
  // columnResizeMode="onEnd"
/>`}
      </CodeBlock>

      <h2>Persisting Column Sizes</h2>
      <p>
        You can save and restore column sizes to provide a consistent experience across sessions:
      </p>

      <CodeBlock language="tsx">
{`import { useState, useEffect } from 'react';
import { VirtualizedTable } from '@rttui/core';

function TableWithPersistedColumnSizes() {
  // Load saved column sizes from storage
  const [columnSizes, setColumnSizes] = useState(() => {
    const savedSizes = localStorage.getItem('tableName_columnSizes');
    return savedSizes ? JSON.parse(savedSizes) : {};
  });
  
  // Save column sizes when they change
  const handleColumnSizesChange = (newSizes) => {
    setColumnSizes(newSizes);
    localStorage.setItem('tableName_columnSizes', JSON.stringify(newSizes));
  };
  
  return (
    <VirtualizedTable
      columns={columns}
      data={data}
      enableColumnResizing={true}
      columnSizes={columnSizes}
      onColumnSizesChange={handleColumnSizesChange}
    />
  );
}`}
      </CodeBlock>

      <h2>Resize with Column Auto-sizing</h2>
      <p>
        You can combine column resizing with auto-sizing for a better user experience:
      </p>

      <CodeBlock language="tsx">
{`import { VirtualizedTable } from '@rttui/core';

function AutoSizeAndResizableTable() {
  return (
    <VirtualizedTable
      columns={columns}
      data={data}
      // Enable both features
      enableColumnResizing={true}
      enableColumnAutoSizing={true}
      
      // Auto-size first, then allow manual resizing
      columnAutoSizingOptions={{
        mode: 'onMount', // Auto-size only when the table first mounts
      }}
    />
  );
}`}
      </CodeBlock>

      <h2>Double-click to Auto-size</h2>
      <p>
        You can implement double-click behavior to automatically resize columns to fit their content:
      </p>

      <CodeBlock language="tsx">
{`import { useRef } from 'react';
import { VirtualizedTable } from '@rttui/core';

function DoubleClickAutoSizeTable() {
  const tableRef = useRef(null);
  
  // Custom resizer component with double-click functionality
  const AutoSizeResizer = ({ column, onMouseDown, onTouchStart }) => {
    const handleDoubleClick = () => {
      // Auto-size this specific column
      tableRef.current?.autoSizeColumn(column.id);
    };
    
    return (
      <div
        className="w-2 h-full cursor-col-resize absolute right-0 top-0 bottom-0 z-10"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onDoubleClick={handleDoubleClick}
        title="Drag to resize or double-click to auto-size"
      >
        <div className={\`
          w-px h-4/6 bg-current opacity-50 mx-auto
          \${column.getIsResizing() ? 'bg-blue-500' : 'bg-gray-400'}
        \`} />
      </div>
    );
  };
  
  return (
    <VirtualizedTable
      ref={tableRef}
      columns={columns}
      data={data}
      enableColumnResizing={true}
      resizerComponent={AutoSizeResizer}
    />
  );
}`}
      </CodeBlock>

      <h2>Best Practices</h2>
      <ul>
        <li>
          Set appropriate <code>minSize</code> values to prevent columns from becoming too narrow to read.
        </li>
        <li>
          Consider disabling resizing for some columns (like ID columns or action buttons) that should maintain a fixed width.
        </li>
        <li>
          Use <code>maxSize</code> to prevent columns from becoming excessively wide, especially for columns with potentially long content.
        </li>
        <li>
          Choose an appropriate resize mode based on your users' needs: <code>onChange</code> for immediate feedback or <code>onEnd</code> for less frequent updates.
        </li>
        <li>
          Persist column sizes to localStorage or your backend to provide a consistent user experience across sessions.
        </li>
        <li>
          Provide visual feedback during resizing to help users understand what's happening.
        </li>
        <li>
          Consider implementing double-click to auto-size as a convenient feature for users.
        </li>
      </ul>
    </div>
  );
} 