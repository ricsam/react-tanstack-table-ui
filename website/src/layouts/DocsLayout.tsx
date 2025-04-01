import { Outlet } from '@tanstack/react-router';

export function DocsLayout() {
  return (
    <div className="h-full p-8">
      <div>
        <Outlet />
      </div>
    </div>
  );
} 