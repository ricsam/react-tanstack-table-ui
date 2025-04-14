import { CodeBlock } from "@/components/code_block";

export function ToggleColPinningPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
      <h1>Toggle Column Pinning</h1>
      <p>
        Column pinning allows users to lock specific columns in place while scrolling horizontally
        through a wide table. React TanStack Table UI provides built-in support for pinning columns
        to the left or right edge of the table.
      </p>

      <h2>Basic Setup</h2>
      <p>
        To enable column pinning, you need to configure your table to support it:
      </p>

      <CodeBlock language="tsx">
{`import { VirtualizedTable, createColumnHelper } from '@rttui/core';

const columnHelper = createColumnHelper<Person>();

// Define columns with pinning options
const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    // Pin this column to the left
    pin: 'left',
  }),
  columnHelper.accessor('firstName', {
    header: 'First Name',
  }),
  columnHelper.accessor('lastName', {
    header: 'Last Name',
  }),
  // More columns...
  columnHelper.accessor('actions', {
    header: 'Actions',
    // Pin this column to the right
    pin: 'right',
  }),
];

function PersonTable() {
  return (
    <VirtualizedTable
      columns={columns}
      data={data}
      enableColumnPinning={true}
      // Other props...
    />
  );
}`}
      </CodeBlock>

      <h2>Toggling Pinned Columns</h2>
      <p>
        You can implement UI controls to allow users to dynamically toggle column pinning:
      </p>

      <CodeBlock language="tsx">
{`import { useState } from 'react';
import { VirtualizedTable, createColumnHelper } from '@rttui/core';

function PinnableTable() {
  const [columnPinning, setColumnPinning] = useState({
    left: ['id'], // Columns pinned to the left
    right: ['actions'], // Columns pinned to the right
  });

  // Define columns
  const columns = [
    columnHelper.accessor('id', { header: 'ID' }),
    columnHelper.accessor('firstName', { header: 'First Name' }),
    columnHelper.accessor('lastName', { header: 'Last Name' }),
    // More columns...
    columnHelper.accessor('actions', { header: 'Actions' }),
  ];

  // Toggle function for column pinning
  const toggleColumnPin = (columnId, position) => {
    setColumnPinning(prev => {
      // If already pinned to this position, unpin it
      if (prev[position].includes(columnId)) {
        return {
          ...prev,
          [position]: prev[position].filter(id => id !== columnId)
        };
      }
      
      // If pinned to the other position, move it
      const otherPos = position === 'left' ? 'right' : 'left';
      if (prev[otherPos].includes(columnId)) {
        return {
          ...prev,
          [position]: [...prev[position], columnId],
          [otherPos]: prev[otherPos].filter(id => id !== columnId)
        };
      }
      
      // Otherwise, pin it to the selected position
      return {
        ...prev,
        [position]: [...prev[position], columnId]
      };
    });
  };

  return (
    <div>
      {/* Pinning controls */}
      <div className="mb-4">
        <h3>Column Pinning Controls</h3>
        <div className="flex flex-wrap gap-2">
          {columns.map(column => (
            <div key={column.id} className="border p-2 rounded">
              <span>{column.header}</span>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => toggleColumnPin(column.id, 'left')}
                  className={columnPinning.left.includes(column.id) ? 'bg-blue-500 text-white' : ''}
                >
                  Pin Left
                </button>
                <button
                  onClick={() => toggleColumnPin(column.id, 'right')}
                  className={columnPinning.right.includes(column.id) ? 'bg-blue-500 text-white' : ''}
                >
                  Pin Right
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Table with column pinning */}
      <VirtualizedTable
        columns={columns}
        data={data}
        enableColumnPinning={true}
        columnPinning={columnPinning}
        onColumnPinningChange={setColumnPinning}
      />
    </div>
  );
}`}
      </CodeBlock>

      <h2>Pinning with Context Menu</h2>
      <p>
        You can also implement a context menu for column headers to enable pinning:
      </p>

      <CodeBlock language="tsx">
{`import { useState, useRef } from 'react';
import { VirtualizedTable, createColumnHelper } from '@rttui/core';

function ContextMenuPinningTable() {
  const [columnPinning, setColumnPinning] = useState({
    left: [],
    right: [],
  });
  
  // Custom header with context menu
  const HeaderCell = ({ column }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    
    const handleContextMenu = (e) => {
      e.preventDefault();
      setShowMenu(true);
    };
    
    const pinLeft = () => {
      setColumnPinning(prev => ({
        left: [...prev.left, column.id],
        right: prev.right.filter(id => id !== column.id),
      }));
      setShowMenu(false);
    };
    
    const pinRight = () => {
      setColumnPinning(prev => ({
        left: prev.left.filter(id => id !== column.id),
        right: [...prev.right, column.id],
      }));
      setShowMenu(false);
    };
    
    const unpinColumn = () => {
      setColumnPinning(prev => ({
        left: prev.left.filter(id => id !== column.id),
        right: prev.right.filter(id => id !== column.id),
      }));
      setShowMenu(false);
    };
    
    // Close menu when clicking outside
    useEffect(() => {
      if (!showMenu) return;
      
      const handleClickOutside = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
          setShowMenu(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);
    
    return (
      <div className="relative" onContextMenu={handleContextMenu}>
        {column.header}
        
        {showMenu && (
          <div ref={menuRef} className="absolute z-10 bg-white shadow-md border rounded p-2 mt-1">
            <button className="block w-full text-left py-1 px-2 hover:bg-gray-100" onClick={pinLeft}>
              Pin Left
            </button>
            <button className="block w-full text-left py-1 px-2 hover:bg-gray-100" onClick={pinRight}>
              Pin Right
            </button>
            <button className="block w-full text-left py-1 px-2 hover:bg-gray-100" onClick={unpinColumn}>
              Unpin
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Define columns with custom header
  const columns = [
    columnHelper.accessor('id', { 
      header: props => <HeaderCell column={props.column} />,
    }),
    // Other columns with similar header...
  ];
  
  return (
    <VirtualizedTable
      columns={columns}
      data={data}
      enableColumnPinning={true}
      columnPinning={columnPinning}
    />
  );
}`}
      </CodeBlock>

      <h2>Styling Pinned Columns</h2>
      <p>
        Pinned columns can have special styling to distinguish them from regular columns:
      </p>

      <CodeBlock language="tsx">
{`// Custom styling for pinned columns
const pinnedColumnStyle = {
  left: {
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    // Other styles for left-pinned columns
  },
  right: {
    boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
    // Other styles for right-pinned columns
  }
};

// Inside your component
<VirtualizedTable
  columns={columns}
  data={data}
  enableColumnPinning={true}
  columnPinning={columnPinning}
  pinnedColumnStyles={pinnedColumnStyle}
  // Other props...
/>`}
      </CodeBlock>

      <h2>Best Practices</h2>
      <ul>
        <li>
          Pin important identifier columns (like IDs or names) to the left for easy reference.
        </li>
        <li>
          Pin action columns (like edit/delete buttons) to the right for consistent access.
        </li>
        <li>
          Limit the number of pinned columns to avoid excessive fixed areas that could make the
          scrollable area too narrow.
        </li>
        <li>
          Consider adding visual indicators (like shadows or borders) to help users distinguish
          between pinned and scrollable sections.
        </li>
        <li>
          Allow users to customize which columns are pinned based on their specific workflow needs.
        </li>
      </ul>
    </div>
  );
} 