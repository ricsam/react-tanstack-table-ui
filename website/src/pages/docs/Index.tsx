import { Link } from '@tanstack/react-router';

export function DocsIndexPage() {
  return (
    <div className="prose max-w-none">
      <h1>Documentation</h1>
      
      <p>
        Welcome to the React TanStack Table UI documentation. This library provides a set of
        components and utilities for building powerful, customizable tables with TanStack Table
        and virtual scrolling support.
      </p>
      
      <h2>What is React TanStack Table UI?</h2>
      
      <p>
        React TanStack Table UI is a collection of components and utilities built on top of
        TanStack Table (formerly React Table v8) and TanStack Virtual. It provides a highly
        customizable and performant solution for rendering large datasets in tables with features
        like virtual scrolling, sorting, filtering, and more.
      </p>
      
      <h2>Key Sections</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold mb-2">
            <Link to="/docs/getting-started" className="text-primary-600 hover:text-primary-700">
              Getting Started
            </Link>
          </h3>
          <p className="text-gray-600">
            Learn how to install and set up React TanStack Table UI in your project.
          </p>
        </div>
        
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold mb-2">
            <Link to="/docs/getting-started" className="text-primary-600 hover:text-primary-700">
              Core Concepts
            </Link>
          </h3>
          <p className="text-gray-600">
            Understand the key concepts and architecture of the library.
          </p>
        </div>
        
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold mb-2">
            <Link to="/examples" className="text-primary-600 hover:text-primary-700">
              Examples
            </Link>
          </h3>
          <p className="text-gray-600">
            Explore interactive examples showcasing different features and use cases.
          </p>
        </div>
        
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold mb-2">
            <Link to="/api" className="text-primary-600 hover:text-primary-700">
              API Reference
            </Link>
          </h3>
          <p className="text-gray-600">
            Detailed documentation of components, hooks, and utilities.
          </p>
        </div>
      </div>
      
      <h2 className="mt-8">Getting Help</h2>
      
      <p>
        If you need help or have questions about React TanStack Table UI, you can:
      </p>
      
      <ul>
        <li>
          <a 
            href="https://github.com/ricsam/react-tanstack-table-ui/issues" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700"
          >
            Open an issue on GitHub
          </a>
        </li>
        <li>
          <a 
            href="https://github.com/ricsam/react-tanstack-table-ui/discussions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700"
          >
            Start a discussion on GitHub
          </a>
        </li>
      </ul>
    </div>
  );
} 