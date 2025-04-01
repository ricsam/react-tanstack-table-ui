import React from 'react';
import { Link, useRouter } from '@tanstack/react-router';

const examples = [
  {
    title: 'Basic Table Example',
    path: '/examples/basic',
    description: 'A simple table with basic functionality showing how to get started with React TanStack Table UI.',
  },
  {
    title: 'Virtual Scrolling Example',
    path: '/examples/virtual',
    description: 'Efficiently render large datasets with virtual scrolling to maintain performance.',
  },
  {
    title: 'Custom Skins Example',
    path: '/examples/skins',
    description: 'Explore different skin options including Material UI and Anocca themes.',
  },
  {
    title: 'Filtering and Sorting Example',
    path: '/examples/filtering',
    description: 'Learn how to implement column filtering and sorting in your tables.',
  },
  {
    title: 'Customization Example',
    path: '/examples/customization',
    description: 'Customize your table with custom cell renderers and header styles.',
  },
];

export function ExamplesSidebar() {
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sticky top-8">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Examples</h2>
      <ul className="space-y-2">
        {examples.map((example) => (
          <li key={example.path}>
            <Link
              to={example.path}
              className={`block w-full text-left px-3 py-2 rounded-md ${
                currentPath === example.path
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {example.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
} 