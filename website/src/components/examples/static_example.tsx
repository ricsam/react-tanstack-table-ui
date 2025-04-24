import { PrimaryLinkButton } from "@/components/primary_link_button";
import { useMatches } from "@tanstack/react-router";
import React from "react";

const classNames = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};

type Example = {
  title: string;
  description: string;
  dirName: string;
  mainFile: string;
};

type Tab = {
  name: string;
  href: string;
  id: string;
};
declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    example?: Example;
  }
}

export function StaticExample() {
  const matches = useMatches();
  const [activeTab, setActiveTab] = React.useState<string>("dist");

  let example: Example | undefined;

  matches.forEach((match) => {
    example = match.staticData?.example;
  });

  if (!example) {
    throw new Error("Example not found");
  }

  const stackblitzUrl = `https://stackblitz.com/github/ricsam/react-tanstack-table-ui/tree/main/examples/${example.dirName}?embed=1&theme=dark&preset=node&file=${example.mainFile}`;
  const codesandboxUrl = `https://codesandbox.io/p/devbox/github/ricsam/react-tanstack-table-ui/tree/main/examples/${example.dirName}?embed=1&theme=dark&file=${example.mainFile}`;
  const distUrl = `https://rttui-docs.vercel.app/static_examples/${example.dirName}/index.html`;

  const tabs: Tab[] = [
    {
      name: "Preview",
      href: distUrl,
      id: "dist",
    },
    {
      name: "StackBlitz",
      href: stackblitzUrl,
      id: "stackblitz",
    },
    {
      name: "CodeSandbox",
      href: codesandboxUrl,
      id: "codesandbox",
    },
  ];

  return (
    <div
      className="flex flex-col h-full w-full"
      key={activeTab + example.dirName}
    >
      <div className="prose dark:prose-invert p-4 sm:p-6 lg:p-8 mb-2">
        <h1 className="text-2xl sm:text-3xl mb-2">{example.title}</h1>
        <p className="mb-4">{example.description}</p>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mx-4 sm:mx-6 lg:mx-8 mb-4 sm:mb-8 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <PrimaryLinkButton href={stackblitzUrl} className="mb-2 sm:mb-0">
            Open in StackBlitz
          </PrimaryLinkButton>
          <a
            href={codesandboxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Open in CodeSandbox
          </a>
        </div>

        <div className="p-4">
          <div className="border-b border-gray-200">
            <nav aria-label="Tabs" className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <a
                  key={tab.name}
                  aria-current={tab.id === activeTab ? "page" : undefined}
                  className={classNames(
                    tab.id === activeTab
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium cursor-pointer",
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.name}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1 min-h-[500px] sm:min-h-[600px] h-full w-full">
          <iframe
            src={tabs.find((tab) => tab.id === activeTab)?.href}
            className="w-full h-full min-h-[500px] sm:min-h-[600px]"
            title={example.title}
            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
