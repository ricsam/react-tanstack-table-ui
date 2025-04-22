import { CodeBlock } from "@/components/code_block";

export function TailwindComponentsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
      <h1>Tailwind Skin Components</h1>
      <p>
        The Tailwind skin for React TanStack Table UI includes a range of pre-built cell components
        that you can use to display different types of data in your tables.
      </p>

      <p>
        These components are designed to integrate seamlessly with the Tailwind CSS framework and
        provide a consistent and visually appealing way to present various data types.
      </p>

      <h2>Available Components</h2>
      
      <h3>CellText</h3>
      <p>
        A basic text cell component for displaying text content.
      </p>
      <CodeBlock language="tsx">
{`import { CellText } from '@rttui/skin-tailwind';

// In your column definition
columnHelper.accessor('name', {
  header: 'Name',
  cell: ({ getValue }) => <CellText>{getValue()}</CellText>,
})`}
      </CodeBlock>

      <h3>CellTextBold</h3>
      <p>
        Similar to CellText but with bold styling for emphasis.
      </p>
      <CodeBlock language="tsx">
{`import { CellTextBold } from '@rttui/skin-tailwind';

columnHelper.accessor('name', {
  header: 'Name',
  cell: ({ getValue }) => <CellTextBold>{getValue()}</CellTextBold>,
})`}
      </CodeBlock>

      <h3>CellNumber</h3>
      <p>
        Specifically designed for numeric values with appropriate alignment.
      </p>
      <CodeBlock language="tsx">
{`import { CellNumber } from '@rttui/skin-tailwind';

columnHelper.accessor('age', {
  header: 'Age',
  cell: ({ getValue }) => <CellNumber>{getValue()}</CellNumber>,
})`}
      </CodeBlock>

      <h3>CellCurrency</h3>
      <p>
        Formats and displays currency values with proper alignment.
      </p>
      <CodeBlock language="tsx">
{`import { CellCurrency } from '@rttui/skin-tailwind';

columnHelper.accessor('price', {
  header: 'Price',
  cell: ({ getValue }) => <CellCurrency value={getValue()} currency="USD" />,
})`}
      </CodeBlock>

      <h3>CellPercent</h3>
      <p>
        Displays percentage values with the % symbol and proper formatting.
      </p>
      <CodeBlock language="tsx">
{`import { CellPercent } from '@rttui/skin-tailwind';

columnHelper.accessor('progress', {
  header: 'Progress',
  cell: ({ getValue }) => <CellPercent value={getValue()} />,
})`}
      </CodeBlock>

      <h3>CellAvatar</h3>
      <p>
        Displays a user avatar image.
      </p>
      <CodeBlock language="tsx">
{`import { CellAvatar } from '@rttui/skin-tailwind';

columnHelper.accessor('avatar', {
  header: 'Avatar',
  cell: ({ getValue }) => <CellAvatar src={getValue()} alt="User avatar" />,
})`}
      </CodeBlock>

      <h3>CellAvatarWithText</h3>
      <p>
        Combines an avatar with text, useful for user profiles.
      </p>
      <CodeBlock language="tsx">
{`import { CellAvatarWithText } from '@rttui/skin-tailwind';

columnHelper.accessor('user', {
  header: 'User',
  cell: ({ row }) => (
    <CellAvatarWithText
      src={row.original.avatar}
      alt="User avatar"
      primary={row.original.name}
      secondary={row.original.email}
    />
  ),
})`}
      </CodeBlock>

      <h3>CellBadge</h3>
      <p>
        Displays a badge with customizable colors.
      </p>
      <CodeBlock language="tsx">
{`import { CellBadge } from '@rttui/skin-tailwind';

columnHelper.accessor('type', {
  header: 'Type',
  cell: ({ getValue }) => <CellBadge color="blue">{getValue()}</CellBadge>,
})`}
      </CodeBlock>

      <h3>CellTag</h3>
      <p>
        Displays one or more tags.
      </p>
      <CodeBlock language="tsx">
{`import { CellTag } from '@rttui/skin-tailwind';

columnHelper.accessor('tags', {
  header: 'Tags',
  cell: ({ getValue }) => {
    const tags = getValue();
    return <CellTag tags={tags} />;
  },
})`}
      </CodeBlock>

      <h3>CellLink</h3>
      <p>
        Renders a clickable link.
      </p>
      <CodeBlock language="tsx">
{`import { CellLink } from '@rttui/skin-tailwind';

columnHelper.accessor('website', {
  header: 'Website',
  cell: ({ getValue }) => <CellLink href={getValue()}>{getValue()}</CellLink>,
})`}
      </CodeBlock>

      <h3>Checkbox</h3>
      <p>
        A stylized checkbox component for row selection.
      </p>
      <CodeBlock language="tsx">
{`import { Checkbox } from '@rttui/skin-tailwind';

// In your table component
const table = useReactTable({
  // ... other options
  columns: [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox 
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    // ... other columns
  ],
})`}
      </CodeBlock>

      <h2>Customizing Components</h2>
      <p>
        All components accept a <code>className</code> prop that allows you to customize their styling:
      </p>
      <CodeBlock language="tsx">
{`import { CellText } from '@rttui/skin-tailwind';

columnHelper.accessor('name', {
  header: 'Name',
  cell: ({ getValue }) => (
    <CellText className="font-semibold text-indigo-600 dark:text-indigo-400">
      {getValue()}
    </CellText>
  ),
})`}
      </CodeBlock>
    </div>
  );
} 