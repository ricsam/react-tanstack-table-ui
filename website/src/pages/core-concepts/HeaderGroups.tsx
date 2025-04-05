import { CodeBlock } from "@/components/CodeBlock";

export function HeaderGroupsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
      <h1>Header Groups</h1>
      <p>
        Header groups allow you to organize related columns together under common headers, 
        creating a hierarchical structure in your table. This is useful for categorizing data
        and making complex tables more readable.
      </p>

      <h2>Basic Usage</h2>
      <p>
        To create header groups, you can use the <code>columns</code> property in your column definitions:
      </p>

      <CodeBlock language="tsx">
{`import { createColumnHelper, VirtualizedTable } from '@rttui/core';

const columnHelper = createColumnHelper<Person>();

// Define columns with header groups
const columns = [
  // Simple column without grouping
  columnHelper.accessor('id', {
    header: 'ID',
  }),
  
  // Header group for Name columns
  columnHelper.group({
    header: 'Name',
    columns: [
      columnHelper.accessor('firstName', {
        header: 'First',
      }),
      columnHelper.accessor('lastName', {
        header: 'Last',
      }),
    ],
  }),
  
  // Header group for Contact Information
  columnHelper.group({
    header: 'Contact Information',
    columns: [
      columnHelper.accessor('email', {
        header: 'Email',
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
      }),
      columnHelper.accessor('address', {
        header: 'Address',
      }),
    ],
  }),
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

      <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-4 my-6">
        <h3 className="text-yellow-800 dark:text-yellow-200 m-0">Important Gotcha</h3>
        <p className="m-0 mt-2">
          If none of the headers in a group have a <code>header</code> or <code>footer</code> function
          returning a non-null value, the entire row for that group will be filtered away. Always ensure
          at least one column in each group has a valid header or footer.
        </p>
      </div>

      <h2>Customizing Header Groups</h2>
      <p>
        You can customize the appearance and behavior of header groups:
      </p>

      <CodeBlock language="tsx">
{`// Customized header groups
const columns = [
  // Basic columns...
  
  // Customized header group
  columnHelper.group({
    // Basic header text
    header: 'Performance Metrics',
    
    // Or a custom header component
    header: ({ header }) => (
      <div className="flex items-center space-x-2">
        <span className="font-bold">{header.column.columnDef.header}</span>
        <button onClick={() => console.log('Info clicked')}>
          <InfoIcon className="w-4 h-4" />
        </button>
      </div>
    ),
    
    // You can add a footer to the group as well
    footer: 'Performance Summary',
    
    // Set additional properties for this group
    meta: {
      className: 'bg-gray-50 dark:bg-gray-800',
      description: 'Key performance indicators',
    },
    
    // Add a tooltip or description
    accessorFn: () => null,
    cell: info => null,
    
    // Nested columns
    columns: [
      columnHelper.accessor('productivity', {
        header: 'Productivity',
      }),
      columnHelper.accessor('quality', {
        header: 'Quality',
      }),
      columnHelper.accessor('efficiency', {
        header: 'Efficiency',
      }),
    ],
  }),
];`}
      </CodeBlock>

      <h2>Multi-level Header Groups</h2>
      <p>
        You can create deeper hierarchies by nesting header groups:
      </p>

      <CodeBlock language="tsx">
{`// Multi-level header groups
const columns = [
  // Regular columns...
  
  // Top-level group
  columnHelper.group({
    header: 'User Information',
    columns: [
      // Regular column inside the group
      columnHelper.accessor('username', {
        header: 'Username',
      }),
      
      // Nested group inside the top-level group
      columnHelper.group({
        header: 'Personal Details',
        columns: [
          columnHelper.accessor('firstName', { header: 'First Name' }),
          columnHelper.accessor('lastName', { header: 'Last Name' }),
          
          // Even deeper nesting
          columnHelper.group({
            header: 'Contact',
            columns: [
              columnHelper.accessor('email', { header: 'Email' }),
              columnHelper.accessor('phone', { header: 'Phone' }),
            ],
          }),
        ],
      }),
      
      // Another nested group
      columnHelper.group({
        header: 'Account Details',
        columns: [
          columnHelper.accessor('createdAt', { header: 'Created' }),
          columnHelper.accessor('updatedAt', { header: 'Updated' }),
        ],
      }),
    ],
  }),
];`}
      </CodeBlock>

      <h2>Conditional Header Groups</h2>
      <p>
        You can conditionally show or hide header groups based on certain conditions:
      </p>

      <CodeBlock language="tsx">
{`import { useState } from 'react';

function ConditionalHeaderGroupsTable() {
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);
  
  const getColumns = () => {
    const baseColumns = [
      // Basic columns that are always shown
      columnHelper.accessor('id', { header: 'ID' }),
      columnHelper.accessor('name', { header: 'Name' }),
      
      // Basic metrics group
      columnHelper.group({
        header: 'Basic Metrics',
        columns: [
          columnHelper.accessor('sales', { header: 'Sales' }),
          columnHelper.accessor('revenue', { header: 'Revenue' }),
        ],
      }),
    ];
    
    // Conditionally add detailed metrics group
    if (showDetailedMetrics) {
      baseColumns.push(
        columnHelper.group({
          header: 'Detailed Metrics',
          columns: [
            columnHelper.accessor('conversionRate', { header: 'Conversion Rate' }),
            columnHelper.accessor('customerRetention', { header: 'Customer Retention' }),
            columnHelper.accessor('averageOrderValue', { header: 'Avg. Order Value' }),
          ],
        })
      );
    }
    
    return baseColumns;
  };
  
  return (
    <div>
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showDetailedMetrics}
            onChange={() => setShowDetailedMetrics(!showDetailedMetrics)}
          />
          <span>Show Detailed Metrics</span>
        </label>
      </div>
      
      <VirtualizedTable
        columns={getColumns()}
        data={data}
        // Other props...
      />
    </div>
  );
}`}
      </CodeBlock>

      <h2>Styling Header Groups</h2>
      <p>
        You can apply custom styling to header groups to visually distinguish them:
      </p>

      <CodeBlock language="tsx">
{`// Custom styling for header groups
const columns = [
  // Regular columns...
  
  columnHelper.group({
    header: 'Financial Data',
    meta: {
      // Apply specific styling to this group
      headerGroupProps: {
        className: 'bg-green-50 dark:bg-green-900/20 font-bold text-green-800 dark:text-green-200',
        style: { borderBottom: '2px solid #10b981' },
      },
    },
    columns: [
      // Financial columns...
    ],
  }),
  
  columnHelper.group({
    header: 'Customer Data',
    meta: {
      // Different styling for this group
      headerGroupProps: {
        className: 'bg-blue-50 dark:bg-blue-900/20 font-bold text-blue-800 dark:text-blue-200',
        style: { borderBottom: '2px solid #3b82f6' },
      },
    },
    columns: [
      // Customer columns...
    ],
  }),
];

// You can also apply global styling to all header groups
<VirtualizedTable
  columns={columns}
  data={data}
  headerGroupClassName="bg-gray-100 dark:bg-gray-800 font-semibold"
/>`}
      </CodeBlock>

      <h2>Header Group Events</h2>
      <p>
        You can handle events on header groups for interactive features:
      </p>

      <CodeBlock language="tsx">
{`// Header group with event handlers
columnHelper.group({
  header: 'Performance',
  meta: {
    headerGroupProps: {
      onClick: () => console.log('Performance header group clicked'),
      onMouseEnter: () => console.log('Mouse entered performance header group'),
      onMouseLeave: () => console.log('Mouse left performance header group'),
    },
  },
  columns: [
    // Performance-related columns...
  ],
})`}
      </CodeBlock>

      <h2>Collapsible Header Groups</h2>
      <p>
        You can implement collapsible header groups to allow users to show/hide columns:
      </p>

      <CodeBlock language="tsx">
{`import { useState } from 'react';

function CollapsibleHeaderGroupsTable() {
  const [collapsedGroups, setCollapsedGroups] = useState({});
  
  // Toggle a group's collapsed state
  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
  
  // Custom header renderer
  const GroupHeader = ({ header }) => {
    const groupId = header.column.id;
    const isCollapsed = collapsedGroups[groupId];
    
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => toggleGroupCollapse(groupId)}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {isCollapsed ? (
            <span>+</span> // Expand icon
          ) : (
            <span>-</span> // Collapse icon
          )}
        </button>
        <span>{header.column.columnDef.header}</span>
      </div>
    );
  };
  
  // Define columns with collapsible headers
  const columns = [
    // Basic columns...
    
    columnHelper.group({
      id: 'contactInfo',
      header: GroupHeader,
      columns: [
        columnHelper.accessor('email', { header: 'Email' }),
        columnHelper.accessor('phone', { header: 'Phone' }),
        // More columns...
      ],
    }),
    
    columnHelper.group({
      id: 'financialInfo',
      header: GroupHeader,
      columns: [
        columnHelper.accessor('income', { header: 'Income' }),
        columnHelper.accessor('expenses', { header: 'Expenses' }),
        // More columns...
      ],
    }),
  ];
  
  // Filter columns based on collapsed state
  const getVisibleColumns = () => {
    return columns.map(column => {
      // If it's a group column and is collapsed, return only the group header
      if (column.columns && collapsedGroups[column.id]) {
        return {
          ...column,
          columns: [] // Empty array to hide child columns
        };
      }
      return column;
    });
  };
  
  return (
    <VirtualizedTable
      columns={getVisibleColumns()}
      data={data}
      // Other props...
    />
  );
}`}
      </CodeBlock>
    </div>
  );
} 