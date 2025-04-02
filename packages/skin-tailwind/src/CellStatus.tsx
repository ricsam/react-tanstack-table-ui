import React from "react";


export const CellStatus: React.FC<{
  status: string;
  statusMap?: Record<string, string>;
}> = ({ status, statusMap }) => {
  // Default status colors if no map provided
  const defaultStatuses: Record<string, string> = {
    Completed: "text-green-400 bg-green-400/10",
    Success: "text-green-400 bg-green-400/10",
    Error: "text-rose-400 bg-rose-400/10",
    Failed: "text-rose-400 bg-rose-400/10",
    Pending: "text-yellow-400 bg-yellow-400/10",
    Processing: "text-blue-400 bg-blue-400/10",
    Default: "text-gray-400 bg-gray-400/10",
  };

  // Use provided status map or default
  const statuses = statusMap || defaultStatuses;
  const statusClass = statuses[status] || defaultStatuses.Default;

  return (
    <div className="flex items-center gap-x-2">
      <div className={`flex-none rounded-full p-1 ${statusClass}`}>
        <div className="size-1.5 rounded-full bg-current" />
      </div>
      <div className="text-sm text-gray-900 dark:text-white">{status}</div>
    </div>
  );
};
