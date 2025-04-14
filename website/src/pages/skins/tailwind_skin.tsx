import { CodeBlock } from "@/components/code_block";
import { Link } from "@tanstack/react-router";

export function TailwindSkinPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
      <h1>Tailwind Skin</h1>
      <p>
        The Tailwind skin for React TanStack Table UI provides a seamless integration with the 
        Tailwind CSS framework. It includes pre-built components and styles designed to work 
        perfectly with Tailwind's utility classes.
      </p>

      <h2>Installation</h2>
      <p>
        To use the Tailwind skin, you need to install the <code>@rttui/skin-tailwind</code> package:
      </p>

      <CodeBlock language="bash">
        {`npm install @rttui/skin-tailwind`}
      </CodeBlock>

      <p>
        Make sure you have Tailwind CSS already set up in your project. If not, follow the 
        <a href="https://tailwindcss.com/docs/installation" target="_blank" rel="noopener noreferrer"> official Tailwind CSS installation guide</a>.
      </p>

      <h2>Setup</h2>
      <p>
        After installing the package, you need to configure your Tailwind CSS setup to include the Tailwind skin styles.
      </p>

      <h3>For Tailwind CSS &lt; 4</h3>
      <p>
        Add the Tailwind skin directory to your <code>tailwind.config.js</code> content array:
      </p>

      <CodeBlock language="javascript">
{`// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // Add this line to include the Tailwind skin components
    "./node_modules/@rttui/skin-tailwind/**/*.{js,ts,jsx,tsx}"
  ],
  // ... rest of your Tailwind config
}`}
      </CodeBlock>

      <h3>For Tailwind CSS &gt;= 4</h3>
      <p>
        Use the <code>@source</code> directive in your CSS file:
      </p>

      <CodeBlock language="css">
{`/* In your main CSS file */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Include the Tailwind skin styles */
@source "../node_modules/@rttui/skin-tailwind";`}
      </CodeBlock>

      <h2>Usage</h2>
      <p>
        To use the Tailwind skin with your tables, import and use the <code>VirtualizedTable</code> component
        from the Tailwind skin package:
      </p>

      <CodeBlock language="tsx">
{`import { VirtualizedTable } from '@rttui/skin-tailwind';
import { createColumnHelper } from '@rttui/core';

const columnHelper = createColumnHelper<YourDataType>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: info => info.getValue(),
  }),
  // ... other columns
];

function YourTable() {
  return (
    <VirtualizedTable
      columns={columns}
      data={data}
      // Additional props...
    />
  );
}`}
      </CodeBlock>

      <h2>Components</h2>
      <p>
        The Tailwind skin includes a variety of cell components that you can use to display different
        types of data in your tables.
      </p>
      
      <p>
        Check out the <Link to="/skins/tailwind/components">Tailwind Components</Link> page for a detailed overview of all available components.
      </p>

      <h2>Customization</h2>
      <p>
        You can customize the appearance of the Tailwind skin by:
      </p>

      <ol>
        <li>
          <strong>Using your own Tailwind theme:</strong> The skin components will automatically adopt your Tailwind theme colors and spacing.
        </li>
        <li>
          <strong>Extending component styles:</strong> You can pass className props to most components to add your own styling.
        </li>
        <li>
          <strong>Creating custom variants:</strong> Extend the provided components to create your own specialized versions.
        </li>
      </ol>

      <h3>Example: Customizing with Tailwind Theme</h3>
      <p>
        Configure your Tailwind theme colors, and the table components will automatically use them:
      </p>

      <CodeBlock language="javascript">
{`// tailwind.config.js
module.exports = {
  // ... other config
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... other shades
          600: '#0284c7',
          700: '#0369a1',
          // ... etc.
        },
        // ... other custom colors
      },
    },
  },
}`}
      </CodeBlock>

      <p>
        The table components will automatically use your theme colors for elements like
        selected rows, hover states, and more.
      </p>
    </div>
  );
} 