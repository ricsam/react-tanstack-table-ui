import { CodeBlock } from "@/components/code_block";

export function MuiSkinPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
      <h1>Material UI Skin</h1>
      <p>
        The Material UI skin for React TanStack Table UI integrates with the Material UI component
        library to provide a consistent Material Design look and feel for your tables.
      </p>

      <h2>Installation</h2>
      <p>
        To use the MUI skin, you need to install several packages:
      </p>

      <CodeBlock language="bash">
        {`npm install @rttui/skin-mui @mui/material @emotion/react @emotion/styled`}
      </CodeBlock>

      <p>
        This installs the MUI skin along with its peer dependencies: Material UI and Emotion for styling.
      </p>

      <h2>Setup</h2>
      <p>
        After installation, you need to set up the Material UI theme provider in your application:
      </p>

      <CodeBlock language="tsx">
{`import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { VirtualizedTable } from '@rttui/skin-mui';

// Create a theme instance
const theme = createTheme({
  // Customize your theme here
});

function App() {
  return (
    <ThemeProvider theme={theme}>
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
        Once set up, you can use the <code>VirtualizedTable</code> component from the MUI skin package:
      </p>

      <CodeBlock language="tsx">
{`import { VirtualizedTable } from '@rttui/skin-mui';
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

      <h2>Customization</h2>
      <p>
        You can customize the appearance of the MUI skin through the Material UI theme:
      </p>

      <CodeBlock language="tsx">
{`import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Customize primary color
    },
    secondary: {
      main: '#dc004e', // Customize secondary color
    },
    // Customize other colors
  },
  components: {
    // Customize specific MUI components
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
        },
        head: {
          fontWeight: 700,
        },
      },
    },
    // Other component customizations
  },
});`}
      </CodeBlock>

      <h2>Features Coming Soon</h2>
      <p>
        We are actively working on additional features for the MUI skin:
      </p>

      <ul>
        <li>
          <strong>Custom Sorting Components</strong>: MUI-styled sorting indicators and controls 
          that match the Material Design specifications.
        </li>
        <li>
          <strong>Column Pinning UI</strong>: Intuitive interfaces for pinning columns with Material Design aesthetics.
        </li>
        <li>
          <strong>Row Selection Components</strong>: Material Design checkboxes and selection controls 
          integrated with the table's selection functionality.
        </li>
        <li>
          <strong>Filtering Components</strong>: Advanced filtering interfaces using MUI's form components 
          and popovers.
        </li>
        <li>
          <strong>Pagination Components</strong>: Material Design pagination controls for navigating 
          through large datasets.
        </li>
      </ul>

      <p>
        Stay tuned for updates as we continue to enhance the MUI skin with additional components 
        and features!
      </p>

      <h2>Compatibility</h2>
      <p>
        The MUI skin is compatible with:
      </p>

      <ul>
        <li>Material UI v5+</li>
        <li>React 17+</li>
        <li>All modern browsers</li>
      </ul>

      <p>
        For earlier versions of Material UI (v4), you may need to adapt the imports and 
        theme configuration accordingly.
      </p>
    </div>
  );
} 