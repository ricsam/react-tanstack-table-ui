import React from 'react';
import { Link } from '@tanstack/react-router';
import { ExamplesSidebar } from '@/components/ExamplesSidebar';

// Define the type for an individual example
type Example = {
  title: string;
  description: string;
  path: string;
};

// Define the type for the examples object
type ExamplesMap = {
  [key: string]: Example;
};

export function ExamplesPage() {
  // Example data
  const examples: ExamplesMap = {
    basic: {
      title: 'Basic Table Example',
      description: 'A simple table with basic functionality showing how to get started with React TanStack Table UI.',
      path: '/examples/basic',
    },
    virtual: {
      title: 'Virtual Scrolling Example',
      description: 'Efficiently render large datasets with virtual scrolling to maintain performance.',
      path: '/examples/virtual',
    },
    skins: {
      title: 'Custom Skins Example',
      description: 'Explore different skin options including Material UI and Anocca themes.',
      path: '/examples/skins',
    },
    filtering: {
      title: 'Filtering and Sorting Example',
      description: 'Learn how to implement column filtering and sorting in your tables.',
      path: '/examples/filtering',
    },
    customization: {
      title: 'Customization Example',
      description: 'Customize your table with custom cell renderers and header styles.',
      path: '/examples/customization',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="prose dark:prose-invert max-w-none mb-12">
        <h1>Examples</h1>
        <p>
          Browse through these examples to see React TanStack Table UI in action and learn how to implement various
          features in your own projects.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <ExamplesSidebar />
        </aside>

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(examples).map(([key, example]) => (
              <Link
                key={key}
                to={example.path}
                className="block bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{example.title}</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{example.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Need Additional Examples?</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                If you'd like to see examples of specific features or have questions about implementation, 
                please check out our GitHub repository or open an issue.
              </p>
            </div>
            <div className="flex space-x-4 px-6 py-4">
              <a 
                href="https://github.com/ricsam/virtualized-table" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                GitHub Repository
              </a>
              <a 
                href="https://github.com/ricsam/virtualized-table/issues/new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Request Example
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 