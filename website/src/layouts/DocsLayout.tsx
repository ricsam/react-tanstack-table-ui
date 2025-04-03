import { Outlet } from '@tanstack/react-router';

export function DocsLayout() {
  return (
    <div className="h-full p-4 sm:p-6 lg:p-8 max-w-full">
      <div className="prose dark:prose-invert max-w-none mx-auto">
        <Outlet />
      </div>
    </div>
  );
} 