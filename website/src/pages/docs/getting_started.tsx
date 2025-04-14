import { CodeBlock } from '@/components/CodeBlock';
import { Link } from '@tanstack/react-router';

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
        code={`npm i @rttui/core @tanstack/react-table@8`}
        language="bash"
      />
      
      <p className="mt-4">
        Additionally, you might want to install one of the available{" "}
        <Link to="/skins">skins</Link>. Please read the guide for the skin you would like to use:
      </p>

      <CodeBlock
        code={`# Material UI skin
npm i @rttui/skin-mui @mui/material @emotion/react @emotion/styled

# Tailwind skin
npm i @rttui/skin-tailwind`}
        language="bash"
      />
      
      <h2 className="mt-8">Basic Setup</h2>
      
      <p>
        Here's a simple example of how to use React TanStack Table UI with the core package:
      </p>
      
      <CodeBlock
        code={`import React from 'react';
import { ReactTanstackTableUi, useTableContext } from "@rttui/core";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

type Person = {
  firstName: string
  lastName: string
  age: number
  visits: number
  status: string
  progress: number
}

const data: Person[] = [
  {
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
  },
  {
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
]

const columnHelper = createColumnHelper<Person>()

const columns = [
  columnHelper.accessor('firstName', {
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor(row => row.lastName, {
    id: 'lastName',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Last Name</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor('age', {
    header: () => 'Age',
    cell: info => info.renderValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('visits', {
    header: () => <span>Visits</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    footer: info => info.column.id,
  }),
  columnHelper.accessor('progress', {
    header: 'Profile Progress',
    footer: info => info.column.id,
  }),
]

function MyTable() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Use the table hooks and render the table
  return (
    <div>
      <ReactTanstackTableUi table={table} width={800} height={400} />
    </div>
  );
}

export default MyTable;`}
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