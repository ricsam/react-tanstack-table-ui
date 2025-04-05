import { CodeBlock } from "@/components/CodeBlock";

export function TableAutoSizingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
      <h1>Table Auto Sizing</h1>
      <p>
        React TanStack Table UI provides automatic table sizing functionality, allowing your tables
        to adapt to their container's dimensions. This feature is essential for creating responsive
        tables that fit perfectly within their parent elements.
      </p>

      <h2>Basic Usage</h2>
      <p>
        To enable table auto sizing, use the <code>autoSize</code> prop when rendering your table:
      </p>

      <CodeBlock language="tsx">
{`import { VirtualizedTable } from '@rttui/core';

function ResponsiveTable() {
  return (
    <div className="h-full w-full">
      <VirtualizedTable
        columns={columns}
        data={data}
        autoSize={true}
        // Other props...
      />
    </div>
  );
}`}
      </CodeBlock>

      <h2>Container-Based Sizing</h2>
      <p>
        By default, the table will size itself based on its container element. This means you need to ensure
        the container has defined dimensions:
      </p>

      <CodeBlock language="tsx">
{`// CSS approach
<div className="h-screen w-full"> {/* Full viewport height */}
  <VirtualizedTable autoSize={true} ... />
</div>

// Inline style approach
<div style={{ height: 500, width: '100%' }}>
  <VirtualizedTable autoSize={true} ... />
</div>

// Fixed dimensions
<div style={{ height: 400, width: 800 }}>
  <VirtualizedTable autoSize={true} ... />
</div>`}
      </CodeBlock>

      <h2>Sizing Options</h2>
      <p>
        You can customize auto sizing behavior with additional props:
      </p>

      <CodeBlock language="tsx">
{`<VirtualizedTable
  // Basic auto sizing
  autoSize={true}
  
  // Set a minimum width for the table
  minWidth={600}
  
  // Set a minimum height for the table
  minHeight={300}
  
  // Set a maximum width (useful for preventing extremely wide tables)
  maxWidth={1200}
  
  // Set a maximum height
  maxHeight={800}
  
  // Other props...
/>`}
      </CodeBlock>

      <h2>Dynamic Resizing</h2>
      <p>
        The table will automatically adjust its dimensions when the container size changes:
      </p>

      <CodeBlock language="tsx">
{`import { useState } from 'react';
import { VirtualizedTable } from '@rttui/core';

function ResizableTable() {
  const [containerHeight, setContainerHeight] = useState(400);

  return (
    <div>
      <div>
        <button onClick={() => setContainerHeight(h => h - 50)}>
          Decrease Height
        </button>
        <button onClick={() => setContainerHeight(h => h + 50)}>
          Increase Height
        </button>
      </div>
      
      <div style={{ height: containerHeight, width: '100%' }}>
        <VirtualizedTable
          autoSize={true}
          columns={columns}
          data={data}
        />
      </div>
    </div>
  );
}`}
      </CodeBlock>

      <h2>Performance Considerations</h2>
      <p>
        Table auto sizing involves measuring and recalculating dimensions, which can impact performance.
        Consider the following tips:
      </p>

      <ul>
        <li>
          Use a <code>ResizeObserver</code> to detect container size changes, which is more efficient than 
          listening for window resize events (this is handled automatically by the table).
        </li>
        <li>
          Combine with virtualization to maintain performance with large datasets.
        </li>
        <li>
          If your table container rarely changes size, consider setting <code>disableDynamicSizing={true}</code> 
          to prevent unnecessary recalculations.
        </li>
      </ul>

      <h2>Integration with Column Auto Sizing</h2>
      <p>
        Table auto sizing works well in conjunction with column auto sizing:
      </p>

      <CodeBlock language="tsx">
{`<VirtualizedTable
  // Auto size the table to fit its container
  autoSize={true}
  
  // Also enable column auto sizing
  enableColumnAutoSizing={true}
  
  // Columns and data
  columns={columns}
  data={data}
/>`}
      </CodeBlock>

      <p>
        When combining these features, the columns will size based on their content,
        and the table itself will adapt to its container, creating a fully responsive table.
      </p>

      <h2>Height Calculation Modes</h2>
      <p>
        You can specify how the table's height should be calculated:
      </p>

      <CodeBlock language="tsx">
{`<VirtualizedTable
  autoSize={true}
  
  // Possible values:
  // - 'auto': Calculate based on content (up to maxHeight)
  // - 'container': Fill the container height
  // - 'fixed': Use a fixed height value
  heightMode="container"
  
  // Other props...
/>`}
      </CodeBlock>
    </div>
  );
} 