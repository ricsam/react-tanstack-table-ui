import { CodeBlock } from "@/components/CodeBlock";

export function ToggleRowPinningPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
      <h1>Toggle Row Pinning</h1>
      <p>
        Row pinning allows users to keep important rows visible at all times, even when scrolling through
        a large dataset. React TanStack Table UI supports pinning rows to the top or bottom of the table.
      </p>

      <h2>Basic Setup</h2>
      <p>
        To enable row pinning, configure your table with the appropriate options:
      </p>

      <CodeBlock language="tsx">
{`import { VirtualizedTable, createColumnHelper } from '@rttui/core';

function PinnableRowsTable() {
  return (
    <VirtualizedTable
      columns={columns}
      data={data}
      enableRowPinning={true}
      // Other props...
    />
  );
}`}
      </CodeBlock>

      <h2>Pre-defined Pinned Rows</h2>
      <p>
        You can specify which rows should be pinned when the table first renders:
      </p>

      <CodeBlock language="tsx">
{`import { useState } from 'react';
import { VirtualizedTable } from '@rttui/core';

function TableWithPinnedRows() {
  // Initial pinning state
  const [rowPinning, setRowPinning] = useState({
    top: ['row-1', 'row-5'], // Row IDs pinned to the top
    bottom: ['row-20'], // Row IDs pinned to the bottom
  });

  return (
    <VirtualizedTable
      columns={columns}
      data={data}
      enableRowPinning={true}
      rowPinning={rowPinning}
      onRowPinningChange={setRowPinning}
      getRowId={(row) => row.id} // Important for identifying rows
    />
  );
}`}
      </CodeBlock>

      <h2>User-controlled Row Pinning</h2>
      <p>
        Implement UI controls that allow users to pin and unpin rows as needed:
      </p>

      <CodeBlock language="tsx">
{`import { useState } from 'react';
import { VirtualizedTable } from '@rttui/core';

function InteractivePinnedRowsTable() {
  const [rowPinning, setRowPinning] = useState({
    top: [],
    bottom: [],
  });

  // Add a custom column for pinning controls
  const columns = [
    // Your existing columns...
    {
      id: 'pin-controls',
      header: 'Pin',
      cell: ({ row }) => {
        const rowId = row.id;
        const isPinnedTop = rowPinning.top.includes(rowId);
        const isPinnedBottom = rowPinning.bottom.includes(rowId);
        
        const pinToTop = () => {
          setRowPinning(prev => ({
            top: [...prev.top, rowId],
            bottom: prev.bottom.filter(id => id !== rowId),
          }));
        };
        
        const pinToBottom = () => {
          setRowPinning(prev => ({
            top: prev.top.filter(id => id !== rowId),
            bottom: [...prev.bottom, rowId],
          }));
        };
        
        const unpinRow = () => {
          setRowPinning(prev => ({
            top: prev.top.filter(id => id !== rowId),
            bottom: prev.bottom.filter(id => id !== rowId),
          }));
        };
        
        return (
          <div className="flex space-x-1">
            <button
              onClick={pinToTop}
              disabled={isPinnedTop}
              title="Pin to top"
              className={isPinnedTop ? 'bg-blue-500 text-white' : ''}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            
            <button
              onClick={unpinRow}
              disabled={!isPinnedTop && !isPinnedBottom}
              title="Unpin"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <button
              onClick={pinToBottom}
              disabled={isPinnedBottom}
              title="Pin to bottom"
              className={isPinnedBottom ? 'bg-blue-500 text-white' : ''}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <VirtualizedTable
      columns={columns}
      data={data}
      enableRowPinning={true}
      rowPinning={rowPinning}
      onRowPinningChange={setRowPinning}
      getRowId={(row) => row.id}
    />
  );
}`}
      </CodeBlock>

      <h2>Context Menu for Row Pinning</h2>
      <p>
        Implement a right-click context menu to control row pinning:
      </p>

      <CodeBlock language="tsx">
{`import { useState, useRef, useEffect } from 'react';
import { VirtualizedTable } from '@rttui/core';

function ContextMenuRowPinningTable() {
  const [rowPinning, setRowPinning] = useState({ top: [], bottom: [] });
  const [contextMenu, setContextMenu] = useState({ 
    show: false, 
    x: 0, 
    y: 0, 
    rowId: null 
  });
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    if (!contextMenu.show) return;
    
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu({ ...contextMenu, show: false });
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu]);
  
  // Row event handlers
  const onRowContextMenu = (event, row) => {
    event.preventDefault();
    setContextMenu({
      show: true,
      x: event.clientX,
      y: event.clientY,
      rowId: row.id,
    });
  };
  
  // Pin actions
  const pinToTop = () => {
    const { rowId } = contextMenu;
    setRowPinning(prev => ({
      top: [...prev.top, rowId],
      bottom: prev.bottom.filter(id => id !== rowId),
    }));
    setContextMenu({ ...contextMenu, show: false });
  };
  
  const pinToBottom = () => {
    const { rowId } = contextMenu;
    setRowPinning(prev => ({
      top: prev.top.filter(id => id !== rowId),
      bottom: [...prev.bottom, rowId],
    }));
    setContextMenu({ ...contextMenu, show: false });
  };
  
  const unpinRow = () => {
    const { rowId } = contextMenu;
    setRowPinning(prev => ({
      top: prev.top.filter(id => id !== rowId),
      bottom: prev.bottom.filter(id => id !== rowId),
    }));
    setContextMenu({ ...contextMenu, show: false });
  };
  
  // Style for highlighting pinned rows
  const getRowClassName = (row) => {
    if (rowPinning.top.includes(row.id)) return 'bg-blue-50 dark:bg-blue-900/30';
    if (rowPinning.bottom.includes(row.id)) return 'bg-green-50 dark:bg-green-900/30';
    return '';
  };
  
  return (
    <div className="relative">
      <VirtualizedTable
        columns={columns}
        data={data}
        enableRowPinning={true}
        rowPinning={rowPinning}
        onRowPinningChange={setRowPinning}
        getRowId={(row) => row.id}
        onRowContextMenu={onRowContextMenu}
        rowClassName={getRowClassName}
      />
      
      {/* Context Menu */}
      {contextMenu.show && (
        <div 
          ref={menuRef}
          className="absolute z-50 bg-white dark:bg-gray-800 shadow-lg border rounded py-1"
          style={{ 
            top: \`\${contextMenu.y}px\`, 
            left: \`\${contextMenu.x}px\` 
          }}
        >
          <button 
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={pinToTop}
          >
            Pin to Top
          </button>
          <button 
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={pinToBottom}
          >
            Pin to Bottom
          </button>
          <button 
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={unpinRow}
          >
            Unpin Row
          </button>
        </div>
      )}
    </div>
  );
}`}
      </CodeBlock>

      <h2>Styling Pinned Rows</h2>
      <p>
        Add visual distinction to pinned rows to help users identify them:
      </p>

      <CodeBlock language="tsx">
{`// Custom styling for pinned rows
const pinnedRowStyles = {
  top: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue
    borderBottom: '2px solid #3b82f6',
    fontWeight: 'bold',
  },
  bottom: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Light green
    borderTop: '2px solid #10b981',
    fontWeight: 'bold',
  }
};

// Apply styles to your table
<VirtualizedTable
  columns={columns}
  data={data}
  enableRowPinning={true}
  rowPinning={rowPinning}
  pinnedRowStyles={pinnedRowStyles}
  // Other props...
/>`}
      </CodeBlock>

      <h2>Best Practices</h2>
      <ul>
        <li>
          Pin summary or total rows to the bottom to keep them visible while scrolling through data.
        </li>
        <li>
          Pin important records to the top for quick reference (e.g., recent transactions, high-priority items).
        </li>
        <li>
          Apply distinct visual styling to pinned rows so users can easily identify them.
        </li>
        <li>
          Limit the number of pinned rows to maintain good usability and maximize the viewable area for regular rows.
        </li>
        <li>
          Consider providing clear UI affordances for pinning/unpinning rows to make the feature discoverable.
        </li>
        <li>
          For tables with many rows, consider implementing both row pinning and row virtualization for optimal performance.
        </li>
      </ul>

      <h2>Integration with Row Selection</h2>
      <p>
        Row pinning works well with row selection features, allowing users to select multiple rows
        and pin them all at once:
      </p>

      <CodeBlock language="tsx">
{`// Example of combining row selection with pinning
function SelectAndPinTable() {
  const [rowSelection, setRowSelection] = useState({});
  const [rowPinning, setRowPinning] = useState({ top: [], bottom: [] });
  
  // Pin all selected rows to top
  const pinSelectedToTop = () => {
    const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]);
    setRowPinning(prev => ({
      top: [...new Set([...prev.top, ...selectedIds])],
      bottom: prev.bottom.filter(id => !selectedIds.includes(id)),
    }));
  };
  
  // Similarly for pinning to bottom...
  
  return (
    <div>
      <div className="mb-4 flex space-x-2">
        <button onClick={pinSelectedToTop}>Pin Selected to Top</button>
        <button onClick={pinSelectedToBottom}>Pin Selected to Bottom</button>
        <button onClick={unpinSelected}>Unpin Selected</button>
      </div>
      
      <VirtualizedTable
        columns={columns}
        data={data}
        enableRowSelection={true}
        enableRowPinning={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        rowPinning={rowPinning}
        onRowPinningChange={setRowPinning}
        getRowId={(row) => row.id}
      />
    </div>
  );
}`}
      </CodeBlock>
    </div>
  );
} 