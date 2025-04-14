import { PrimaryLinkButton } from "@/components/primary_link_button";

interface ExampleProps {
  title: string;
  description: string;
  stackblitzUrl: string;
  codesandboxUrl: string;
}

export function ExampleLayout({
  title,
  description,
  stackblitzUrl,
  codesandboxUrl,
}: ExampleProps) {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="prose dark:prose-invert p-4 sm:p-6 lg:p-8 mb-2">
        <h1 className="text-2xl sm:text-3xl mb-2">{title}</h1>
        <p className="mb-4">{description}</p>
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

        <div className="flex-1 min-h-[500px] sm:min-h-[600px] h-full w-full">
          <iframe
            src={stackblitzUrl}
            className="w-full h-full"
            title={title}
            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
