import { CodeBlock } from "@/components/CodeBlock";

export function DefaultSkinPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
      <h1>Default Skin</h1>
      <p>
        The default skin is included with <code>@rttui/core</code> and provides a basic styling
        for your tables. It includes CSS variables for both light and dark mode themes.
      </p>

      <h2>Installation</h2>
      <p>
        No additional installation is needed as the default skin is included in the core package.
        Just make sure you have installed <code>@rttui/core</code>:
      </p>

      <CodeBlock language="bash">
        {`npm install @rttui/core`}
      </CodeBlock>

      <h2>Theme Variables</h2>
      <p>
        The default skin includes CSS variables for both light and dark modes. You can customize these
        variables to match your design system.
      </p>

      <h3>Light Mode Variables</h3>
      <CodeBlock language="css">
        {`/* Light mode variables */
:root {
  --rttui-table-background: #ffffff;
  --rttui-header-background: #f9fafb;
  --rttui-border-color: #e5e7eb;
  --rttui-text-color: #374151;
  --rttui-header-text-color: #111827;
  --rttui-hover-background: #f3f4f6;
  --rttui-selected-background: #eff6ff;
  --rttui-sorted-background: #f9fafb;
  --rttui-resizer-color: #d1d5db;
  --rttui-resizer-hover-color: #9ca3af;
}`}
      </CodeBlock>

      <h3>Dark Mode Variables</h3>
      <CodeBlock language="css">
        {`/* Dark mode variables */
:root.dark {
  --rttui-table-background: #1f2937;
  --rttui-header-background: #111827;
  --rttui-border-color: #374151;
  --rttui-text-color: #d1d5db;
  --rttui-header-text-color: #f9fafb;
  --rttui-hover-background: #374151;
  --rttui-selected-background: #1e3a8a;
  --rttui-sorted-background: #1f2937;
  --rttui-resizer-color: #4b5563;
  --rttui-resizer-hover-color: #6b7280;
}`}
      </CodeBlock>

      <h2>Usage</h2>
      <p>
        The default skin is applied automatically when you use the <code>VirtualizedTable</code> component
        from <code>@rttui/core</code>. No additional setup is required.
      </p>

      <CodeBlock language="tsx">
        {`import { VirtualizedTable } from '@rttui/core';

function MyTable() {
  // Table configuration
  return (
    <VirtualizedTable
      // Your table props
    />
  );
}`}
      </CodeBlock>

      <h2>Customization</h2>
      <p>
        You can customize the appearance of the default skin by overriding the CSS variables in your
        application's CSS:
      </p>

      <CodeBlock language="css">
        {`:root {
  --rttui-table-background: #f8fafc; /* Custom background color */
  --rttui-border-color: #cbd5e1; /* Custom border color */
  /* Override other variables as needed */
}

:root.dark {
  --rttui-table-background: #0f172a; /* Custom dark mode background */
  --rttui-border-color: #334155; /* Custom dark mode border */
  /* Override other dark mode variables as needed */
}`}
      </CodeBlock>
    </div>
  );
} 