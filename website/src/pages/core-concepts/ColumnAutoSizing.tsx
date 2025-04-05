import { CodeBlock } from "@/components/CodeBlock";

export function ColumnAutoSizingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
      <h1>Column Auto Sizing</h1>
      <p>
        React TanStack Table UI provides built-in support for automatic column sizing
        based on content. This feature allows your tables to intelligently adjust column
        widths to fit their content, improving readability and user experience.
      </p>

      <h2>Basic Usage</h2>
      <p>
        To enable column auto sizing, you need to use the <code>autoSize</code> property
        when creating your column definitions:
      </p>

      <CodeBlock language="tsx">
{`import { VirtualizedTable, createColumnHelper } from '@rttui/core';

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor('firstName', {
    header: 'First Name',
    // Enable auto sizing for this column
    autoSize: true,
  }),
  columnHelper.accessor('lastName', {
    header: 'Last Name',
    autoSize: true,
  }),
  // Other columns...
];

function PersonTable() {
  return (
    <VirtualizedTable
      columns={columns}
      data={data}
      // Other props...
    />
  );
}`}
      </CodeBlock>

      <h2>Configuration Options</h2>
      <p>
        You can customize the auto sizing behavior with the following options:
      </p>

      <h3>Minimum Width</h3>
      <p>
        Set a minimum width for auto-sized columns:
      </p>

      <CodeBlock language="tsx">
{`columnHelper.accessor('firstName', {
  header: 'First Name',
  autoSize: true,
  minSize: 100, // Minimum width in pixels
})`}
      </CodeBlock>

      <h3>Maximum Width</h3>
      <p>
        Set a maximum width for auto-sized columns:
      </p>

      <CodeBlock language="tsx">
{`columnHelper.accessor('firstName', {
  header: 'First Name',
  autoSize: true,
  maxSize: 300, // Maximum width in pixels
})`}
      </CodeBlock>

      <h3>Initial Width</h3>
      <p>
        Set an initial width before auto-sizing is applied:
      </p>

      <CodeBlock language="tsx">
{`columnHelper.accessor('firstName', {
  header: 'First Name',
  autoSize: true,
  size: 150, // Initial width in pixels
})`}
      </CodeBlock>

      <h2>Table-Level Auto Sizing</h2>
      <p>
        You can also enable auto sizing for all columns at the table level:
      </p>

      <CodeBlock language="tsx">
{`<VirtualizedTable
  columns={columns}
  data={data}
  enableColumnAutoSizing={true}
  // Other props...
/>`}
      </CodeBlock>

      <h2>Best Practices</h2>
      <ul>
        <li>
          Use <code>minSize</code> to ensure columns don't become too narrow to read effectively.
        </li>
        <li>
          Use <code>maxSize</code> to prevent columns from becoming excessively wide,
          especially for text fields that could contain long values.
        </li>
        <li>
          Consider disabling auto sizing for columns that should have fixed widths,
          such as action buttons or simple status indicators.
        </li>
        <li>
          Auto sizing works best when combined with column resizing, allowing users
          to manually adjust sizes after the automatic sizing is applied.
        </li>
      </ul>

      <h2>Performance Considerations</h2>
      <p>
        Auto sizing requires measuring the content of each cell, which can impact
        performance for large tables. If your table has thousands of rows and many
        columns, consider:
      </p>
      <ul>
        <li>Only enabling auto sizing for specific columns that need it</li>
        <li>
          Using <code>size</code> to set reasonable default sizes and allowing
          users to resize columns manually if needed
        </li>
        <li>
          Implementing virtualization (which React TanStack Table UI does by default)
          to improve rendering performance
        </li>
      </ul>
    </div>
  );
} 