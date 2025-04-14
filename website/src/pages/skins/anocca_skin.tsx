import { CodeBlock } from "@/components/code_block";

export function AnoccaSkinPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
      <h1>Anocca Skin</h1>
      <p>
        The Anocca skin for React TanStack Table UI provides a specialized design system
        developed by Anocca. This skin is built on top of Material UI components but with a
        custom design specification.
      </p>

      <h2>Installation</h2>
      <p>
        To use the Anocca skin, you need to install the following packages:
      </p>

      <CodeBlock language="bash">
        {`npm install @rttui/skin-anocca @mui/material @emotion/react @emotion/styled`}
      </CodeBlock>

      <p>
        This installs the Anocca skin along with its peer dependencies: Material UI and Emotion for styling.
      </p>

      <h2>Setup</h2>
      <p>
        After installation, you need to set up the Anocca theme provider in your application:
      </p>

      <CodeBlock language="tsx">
{`import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { VirtualizedTable, AnoccaTheme } from '@rttui/skin-anocca';

function App() {
  return (
    <ThemeProvider theme={AnoccaTheme}>
      {/* CssBaseline provides a consistent baseline */}
      <CssBaseline />
      
      {/* Your application content */}
      <YourTables />
    </ThemeProvider>
  );
}

function YourTables() {
  // Table configuration
  return (
    <VirtualizedTable
      columns={columns}
      data={data}
      // Additional props...
    />
  );
}`}
      </CodeBlock>

      <h2>Usage</h2>
      <p>
        Once set up, you can use the <code>VirtualizedTable</code> component from the Anocca skin package:
      </p>

      <CodeBlock language="tsx">
{`import { VirtualizedTable } from '@rttui/skin-anocca';
import { createColumnHelper } from '@rttui/core';

const columnHelper = createColumnHelper<YourDataType>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: info => info.getValue(),
  }),
  // ... other columns
];

function DataTable() {
  return (
    <VirtualizedTable
      columns={columns}
      data={data}
      // Additional props...
    />
  );
}`}
      </CodeBlock>

      <h2>Theme Customization</h2>
      <p>
        You can customize the Anocca theme by creating a custom theme that extends the base Anocca theme:
      </p>

      <CodeBlock language="tsx">
{`import { createTheme } from '@mui/material/styles';
import { AnoccaTheme } from '@rttui/skin-anocca';

// Create a custom theme extending the Anocca theme
const customTheme = createTheme({
  ...AnoccaTheme,
  palette: {
    ...AnoccaTheme.palette,
    primary: {
      ...AnoccaTheme.palette.primary,
      main: '#your-custom-primary-color',
    },
    // Customize other colors as needed
  },
  // Override other theme properties as needed
});

// Use the custom theme in your ThemeProvider
<ThemeProvider theme={customTheme}>
  {/* Your app content */}
</ThemeProvider>`}
      </CodeBlock>

      <h2>Features Coming Soon</h2>
      <p>
        We are actively working on additional features for the Anocca skin:
      </p>

      <ul>
        <li>
          <strong>Custom Sorting Components</strong>: Specialized sorting indicators and controls 
          that follow the Anocca design system.
        </li>
        <li>
          <strong>Column Pinning UI</strong>: Intuitive interfaces for pinning columns that match
          the Anocca design language.
        </li>
        <li>
          <strong>Row Selection Components</strong>: Custom checkboxes and selection controls 
          integrated with the table's selection functionality.
        </li>
        <li>
          <strong>Custom Cell Components</strong>: Specialized cell renderers for different data types
          that align with the Anocca design system.
        </li>
        <li>
          <strong>Filtering and Pagination</strong>: Advanced interfaces for data filtering and 
          pagination that follow Anocca design patterns.
        </li>
      </ul>

      <p>
        Stay tuned for updates as we continue to enhance the Anocca skin with additional components 
        and features!
      </p>

      <h2>Compatibility</h2>
      <p>
        The Anocca skin has the following compatibility:
      </p>

      <ul>
        <li>Material UI v5+</li>
        <li>React 17+</li>
        <li>All modern browsers</li>
      </ul>

      <h2>Support</h2>
      <p>
        For issues specific to the Anocca skin, please contact the Anocca team or refer to 
        their internal documentation. For general React TanStack Table UI questions, use the 
        standard support channels.
      </p>
    </div>
  );
} 