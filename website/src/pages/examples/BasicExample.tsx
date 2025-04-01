import React from 'react';
import { ExamplesSidebar } from '@/components/ExamplesSidebar';

export function BasicExample() {
  const example = {
    title: 'Basic Table Example',
    description: 'A simple table with basic functionality showing how to get started with React TanStack Table UI.',
    stackblitzUrl: 'https://stackblitz.com/github/ricsam/virtualized-table/tree/main/examples/minimal?embed=1&theme=dark&preset=node&file=src/app.tsx',
    codesandboxUrl: 'https://codesandbox.io/p/devbox/github/ricsam/virtualized-table/tree/main/examples/minimal',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="prose dark:prose-invert max-w-none mb-12">
        <h1>{example.title}</h1>
        <p>{example.description}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <ExamplesSidebar />
        </aside>

        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{example.title}</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{example.description}</p>
            </div>
            
            <div className="flex space-x-4 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <a 
                href={example.stackblitzUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                Open in StackBlitz
              </a>
              <a 
                href={example.codesandboxUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Open in CodeSandbox
              </a>
            </div>
            
            <div className="w-full h-[600px] overflow-hidden">
              <iframe
                src={example.stackblitzUrl}
                className="w-full h-full"
                title={example.title}
                allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 