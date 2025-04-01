import { Link } from "@tanstack/react-router";

// Define the type for an individual example
type Example = {
  title: string;
  description: string;
  path: string;
};

// Examples data
const examples: Record<string, Example> = {
  basic: {
    title: "Basic Table Example",
    description:
      "A simple table with basic functionality showing how to get started with React TanStack Table UI.",
    path: "/examples/basic",
  },
  virtual: {
    title: "Virtual Scrolling Example",
    description:
      "Efficiently render large datasets with virtual scrolling to maintain performance.",
    path: "/examples/virtual",
  },
  skins: {
    title: "Custom Skins Example",
    description:
      "Explore different skin options including Material UI and Anocca themes.",
    path: "/examples/skins",
  },
  filtering: {
    title: "Filtering and Sorting Example",
    description:
      "Learn how to implement column filtering and sorting in your tables.",
    path: "/examples/filtering",
  },
  customization: {
    title: "Customization Example",
    description:
      "Customize your table with custom cell renderers and header styles.",
    path: "/examples/customization",
  },
};

export function ExamplesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="prose dark:prose-invert max-w-none mb-12">
        <h1>Examples</h1>
        <p>
          Browse through these examples to see React TanStack Table UI in action
          and learn how to implement various features in your own projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(examples).map(([key, example]) => (
          <Link
            key={key}
            to={example.path}
            className="block bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {example.title}
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {example.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
