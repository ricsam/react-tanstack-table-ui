import { CodeBlock } from '@/components/CodeBlock';

export function GettingStartedPage() {
  return (
    <div className="prose max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1>Getting Started</h1>
      
      <p>
        This guide will help you get started with React TanStack Table UI. Follow these steps to
        install and set up the library in your React project.
      </p>
      
      <h2>Installation</h2>
      
      <p>
        You can install React TanStack Table UI using npm, yarn, or pnpm:
      </p>
      
      <CodeBlock
        code={`# npm
npm install @rttui/core

# yarn
yarn add @rttui/core

# pnpm
pnpm add @rttui/core`}
        language="bash"
      />
      
      <p className="mt-4">
        Additionally, you might want to install one of the available skins:
      </p>
      
      <CodeBlock
        code={`# Material UI skin
npm install @rttui/skin-mui

# Anocca skin
npm install @rttui/skin-anocca`}
        language="bash"
      />
      
      <h2 className="mt-8">Basic Setup</h2>
      
      <p>
        Here's a simple example of how to use React TanStack Table UI with the core package:
      </p>
      
      <CodeBlock
        code={`import React from 'react';
import { createTable } from '@rttui/core';

// Define your data type
type Person = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
};

// Create a table definition for your data type
const table = createTable<Person>();

// Define some test data
const data = [
  { id: '1', firstName: 'John', lastName: 'Doe', age: 30 },
  { id: '2', firstName: 'Jane', lastName: 'Smith', age: 25 },
  { id: '3', firstName: 'Bob', lastName: 'Johnson', age: 45 },
];

function MyTable() {
  // Define columns
  const columns = React.useMemo(
    () => [
      table.createDataColumn('firstName', {
        header: 'First Name',
        cell: (info) => info.getValue(),
      }),
      table.createDataColumn('lastName', {
        header: 'Last Name',
        cell: (info) => info.getValue(),
      }),
      table.createDataColumn('age', {
        header: 'Age',
        cell: (info) => info.getValue(),
      }),
    ],
    []
  );

  // Use the table hooks and render the table
  return (
    <div>
      <table.Table
        data={data}
        columns={columns}
      />
    </div>
  );
}

export default MyTable;`}
        language="tsx"
      />
      
      <h2 className="mt-8">Using a Skin</h2>
      
      <p>
        To use a skin like Material UI, first install the skin package along with Material UI:
      </p>
      
      <CodeBlock
        code={`npm install @rttui/skin-mui @mui/material @emotion/react @emotion/styled`}
        language="bash"
      />
      
      <p className="mt-4">
        Then, modify your code to use the MUI skin:
      </p>
      
      <CodeBlock
        code={`import React from 'react';
import { MuiTable } from '@rttui/skin-mui';

// Define your data type
type Person = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
};

// Define some test data
const data = [
  { id: '1', firstName: 'John', lastName: 'Doe', age: 30 },
  { id: '2', firstName: 'Jane', lastName: 'Smith', age: 25 },
  { id: '3', firstName: 'Bob', lastName: 'Johnson', age: 45 },
];

function MyMuiTable() {
  // Define columns
  const columns = React.useMemo(
    () => [
      {
        accessorKey: 'firstName',
        header: 'First Name',
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
      },
      {
        accessorKey: 'age',
        header: 'Age',
      },
    ],
    []
  );

  // Render the MUI skinned table
  return (
    <MuiTable
      data={data}
      columns={columns}
    />
  );
}

export default MyMuiTable;`}
        language="tsx"
      />
      
      <h2 className="mt-8">Next Steps</h2>
      
      <p>
        Now that you have a basic table set up, you can explore the following topics:
      </p>
      
      <ul>
        <li>Learn about <a href="#" className="text-primary-600">table virtualization</a> for large datasets</li>
        <li>Explore <a href="#" className="text-primary-600">sorting, filtering, and pagination</a></li>
        <li>Discover <a href="#" className="text-primary-600">custom cell rendering</a></li>
        <li>Create your own <a href="#" className="text-primary-600">custom skin</a></li>
      </ul>
      
      <p>
        Check out the complete <a href="#" className="text-primary-600">API reference</a> for detailed documentation on all components and options.
      </p>
    </div>
  );
} 