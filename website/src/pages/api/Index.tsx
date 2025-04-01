import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';

export function APIPage() {
  const tableExample = `import React from 'react';
import { ReactTanstackTableUi } from '@rttui/core';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

function SimpleTable() {
  // Create your table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  return (
    <ReactTanstackTableUi
      table={table}
      width={800}
      height={400}
      rowOverscan={15}
      columnOverscan={5}
    />
  );
}`;

  const headerHookExample = `import { useVirtualHeader } from '@rttui/core';

// Inside your custom header component:
function CustomHeader({ header }) {
  const virtualHeader = useVirtualHeader(header);
  
  return (
    <div 
      style={{
        ...virtualHeader.dndStyle,
        width: virtualHeader.width,
        backgroundColor: virtualHeader.isPinned ? '#f0f9ff' : 'white',
      }}
    >
      {header.column.columnDef.header}
    </div>
  );
}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="prose max-w-none mb-12">
        <h1>API Reference</h1>
        <p>
          Comprehensive documentation of the React TanStack Table UI API, including components, hooks, and utilities.
        </p>
      </div>

      <div className="space-y-16">
        {/* ReactTanstackTableUi */}
        <div id="reacttanstacktableui">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ReactTanstackTableUi</h2>
          
          <div className="space-y-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">ReactTanstackTableUi</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  The main component for creating virtualized tables.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                      <code>React.ComponentType</code>
                    </dd>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Import</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                      <code>import {'{ ReactTanstackTableUi }'} from '@rttui/core';</code>
                    </dd>
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-1 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Props</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0">
                      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Prop</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Required</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white">table</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400"><code>Table&lt;T&gt;</code></td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Yes</td>
                            <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">TanStack Table instance</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white">width</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400"><code>number</code></td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Yes</td>
                            <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Width of the table in pixels</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white">height</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400"><code>number</code></td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Yes</td>
                            <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Height of the table in pixels</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white">skin</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400"><code>Skin</code></td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">No</td>
                            <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Custom skin for styling the table (default: <code>defaultSkin</code>)</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white">rowOverscan</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400"><code>number</code></td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">No</td>
                            <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Number of rows to render outside of the visible area (default: <code>10</code>)</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white">columnOverscan</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400"><code>number</code></td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">No</td>
                            <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Number of columns to render outside of the visible area (default: <code>3</code>)</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white">rowDndHandler</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400"><code>RowDndHandler&lt;T&gt;</code></td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">No</td>
                            <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Handler for row drag-and-drop functionality</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white">colDndHandler</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400"><code>ColDndHandler&lt;T&gt;</code></td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">No</td>
                            <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">Handler for column drag-and-drop functionality</td>
                          </tr>
                        </tbody>
                      </table>
                    </dd>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                      <p>
                        The <code>ReactTanstackTableUi</code> component is the main entry point for using React TanStack Table UI. 
                        It provides a complete table solution with virtualization, sorting, filtering, and other features.
                      </p>
                      <p className="mt-2">
                        This component integrates TanStack Table with TanStack Virtual to create high-performance tables 
                        for large datasets. When virtualization is enabled, only the visible rows are rendered, 
                        significantly improving performance with large datasets.
                      </p>
                      <p className="mt-2">
                        To use this component, you need to create a table instance using the <code>useReactTable</code> hook 
                        from <code>@tanstack/react-table</code> and pass it to the <code>table</code> prop.
                      </p>
                    </dd>
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-1 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Example</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0">
                      <CodeBlock code={tableExample} language="tsx" className="bg-gray-800 text-white p-4" />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* useVirtualHeader Hook */}
        <div id="usevirtualheader">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">useVirtualHeader</h2>
          
          <div className="space-y-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">useVirtualHeader</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Hook for styling and customizing table headers with virtualization.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                      <code>function</code>
                    </dd>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Import</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                      <code>import {'{ useVirtualHeader }'} from '@rttui/core';</code>
                    </dd>
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Parameters</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                      <code>header: Header</code> - The header object from TanStack Table
                    </dd>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Returns</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                      <code>VirtualHeader</code> - An object with properties to style and position the header
                    </dd>
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-1 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Return Value Properties</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0">
                      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Property</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">type</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><code>"header" | "footer"</code></td>
                            <td className="px-3 py-4 text-sm text-gray-500">Whether this is a header or footer cell</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">isDragging</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><code>boolean</code></td>
                            <td className="px-3 py-4 text-sm text-gray-500">Whether the header is currently being dragged</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">isPinned</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><code>PinPos</code></td>
                            <td className="px-3 py-4 text-sm text-gray-500">Whether the header is pinned (and to which side)</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">width</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><code>number</code></td>
                            <td className="px-3 py-4 text-sm text-gray-500">The width of the header cell</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">dndStyle</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><code>CSSProperties</code></td>
                            <td className="px-3 py-4 text-sm text-gray-500">CSS styles for drag-and-drop functionality</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">headerId</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><code>string</code></td>
                            <td className="px-3 py-4 text-sm text-gray-500">Unique identifier for the header</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">headerIndex</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><code>number</code></td>
                            <td className="px-3 py-4 text-sm text-gray-500">Index of the header in the column array</td>
                          </tr>
                          <tr>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">header</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><code>Header</code></td>
                            <td className="px-3 py-4 text-sm text-gray-500">Reference to the original header object</td>
                          </tr>
                        </tbody>
                      </table>
                    </dd>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                      <p>
                        The <code>useVirtualHeader</code> hook is used to style and customize table headers, especially
                        when using virtualization. It provides properties and styles that can be applied to header elements
                        to ensure they work correctly with the virtual scrolling and other table features.
                      </p>
                      <p className="mt-2">
                        This hook is typically used when creating a custom skin by overriding the <code>HeaderCell</code> component
                        in the skin object passed to the <code>ReactTanstackTableUi</code> component.
                      </p>
                      <p className="mt-2">
                        See the <a href="/docs/quickstart" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Quick Start</a> guide for usage examples.
                      </p>
                    </dd>
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-1 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Example</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0">
                      <CodeBlock code={headerHookExample} language="tsx" className="bg-gray-800 text-white p-4" />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Additional hooks and components sections can be added here */}
      </div>
    </div>
  );
} 