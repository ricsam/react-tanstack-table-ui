import { StorybookEmbed } from "@/components/storybook/storybook_embed";

export function MuiStorybookPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Material UI Skin Storybook</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore the Material UI skin components and their variations in this interactive Storybook.
        </p>
      </div>
      <div className="flex-1">
        <StorybookEmbed skin="mui" />
      </div>
    </div>
  );
} 