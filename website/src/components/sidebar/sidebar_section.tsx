import { useState } from "react";
import { Link } from "@tanstack/react-router";

interface SidebarLinkItem {
  title: string;
  path: string;
}

interface SidebarItemWithChildren {
  title: string;
  children: (SidebarLinkItem | SidebarItemWithChildren)[];
  defaultExpanded?: boolean;
}

type SidebarItem = SidebarLinkItem | SidebarItemWithChildren;

interface SidebarSectionProps {
  title: string;
  items: SidebarItem[];
  defaultExpanded?: boolean;
  path?: string;
}

export function SidebarSection({
  title,
  items,
  defaultExpanded = true,
  path,
}: SidebarSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const isLinkItem = (item: SidebarItem): item is SidebarLinkItem => {
    return "path" in item;
  };

  const renderItem = (item: SidebarItem, depth = 0) => {
    if (isLinkItem(item)) {
      return (
        <Link
          key={item.path}
          to={item.path}
          className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          style={{ paddingLeft: `${16 + depth * 16}px` }}
          activeProps={{
            className:
              "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
          }}
        >
          {item.title}
        </Link>
      );
    } else {
      return (
        <SidebarNestedSection
          key={item.title}
          title={item.title}
          items={item.children}
          depth={depth + 1}
          defaultExpanded={item.defaultExpanded}
        />
      );
    }
  };

  if (items.length === 0 && path) {
    return renderItem({ title, path }, 1);
  }

  return (
    <div className="space-y-1">
      <div
        className="flex items-center px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
        onClick={toggleExpanded}
      >
        <svg
          className={`w-4 h-4 mr-1 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        {title}
      </div>
      {isExpanded && (
        <div className="space-y-1">
          {items.map((item) => renderItem(item, 1))}
        </div>
      )}
    </div>
  );
}

interface SidebarNestedSectionProps {
  title: string;
  items: (SidebarLinkItem | SidebarItemWithChildren)[];
  depth: number;
  defaultExpanded?: boolean;
}

function SidebarNestedSection({
  title,
  items,
  depth,
  defaultExpanded = false,
}: SidebarNestedSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isLinkItem = (item: SidebarItem): item is SidebarLinkItem => {
    return "path" in item;
  };

  return (
    <div className="" style={{ paddingLeft: `${16 + (depth - 2) * 16}px` }}>
      <div className={`space-y-1 ${isExpanded ? "" : ""}`}>
        <div
          // className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          className="flex items-center px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <svg
            className={`w-4 h-4 mr-1 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          {title}
        </div>
        {isExpanded && (
          <div
            style={{
              paddingLeft: `${16 + (depth - 1) * 16}px`,
              marginLeft: "-8px",
            }}
          >
            <div className="space-y-1 border-l border-gray-200 dark:border-gray-700">
              {items.map((item) => {
                if (isLinkItem(item)) {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-none"
                      activeProps={{
                        className:
                          "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                      }}
                      activeOptions={{
                        exact: true,
                      }}
                    >
                      {item.title}
                    </Link>
                  );
                } else {
                  return (
                    <SidebarNestedSection
                      key={item.title}
                      title={item.title}
                      items={item.children}
                      depth={depth + 1}
                      defaultExpanded={item.defaultExpanded}
                    />
                  );
                }
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
