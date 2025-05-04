import React, { ReactNode } from "react";
import ReactDOM from "react-dom/client";
// import { routeTree } from "./routes";
import { MDXProvider } from "@mdx-js/react";
import { ThemeProvider } from "./contexts/theme_provider";
// Import Prism CSS (this is also imported in CodeBlock, but importing here ensures it's available globally)
import "prismjs/themes/prism-tomorrow.css";
import "./index.css";

import { createRouter, RouterProvider } from "@tanstack/react-router";

// Import the generated route tree
import {
  AutoSizer,
  decorateColumnHelper,
  ReactTanstackTableUi,
} from "@rttui/core";
import {
  darkModeVars,
  lightModeVars,
  TailwindSkin
} from "@rttui/skin-tailwind";
import { Toc } from "@stefanprobst/rehype-extract-toc";
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CodeBlock } from "./components/code_block";
import { useTheme } from "./contexts/use_theme";
import { routeTree } from "./routeTree.gen";
// Create a new router instance
const router = createRouter({
  routeTree,
  scrollRestoration: true,
  scrollRestorationBehavior: "instant",
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface StaticDataRouteOption {
    layout?: "full" | "text";
    tableOfContents?: Toc;
  }
}

const components: any = {
  pre: (props: {
    children: { props: { children: string; className: string } };
  }) => {
    return (
      <CodeBlock
        language={props.children.props.className.replace("language-", "")}
      >
        {props.children.props.children}
      </CodeBlock>
    );
  },
  table: React.memo(function Table(props: { children: any }) {
    const [thead, tbody] = props.children;
    const headers = thead.props.children.props.children.map((child: any) => {
      return child.props.children;
    });
    const rows = tbody.props.children.map((row: any) => {
      return row.props.children.map((cell: any) => {
        return cell.props.children;
      });
    });
    const createColumn = decorateColumnHelper(
      createColumnHelper<ReactNode[]>(),
      {
        header: (original) => (
          <div className="text-sm !text-black [&_*]:!text-black dark:[&_*]:!text-gray-100 dark:!text-gray-100 ">
            {original}
          </div>
        ),
        cell: (original) => (
          <div className="text-sm !text-gray-700 [&_*]:!text-gray-700 dark:[&_*]:!text-gray-300 dark:!text-gray-300 ">
            {original}
          </div>
        ),
      },
    );
    const columns: ColumnDef<ReactNode[]>[] = headers.map(
      (header: any, index: number): ColumnDef<ReactNode[]> => {
        return createColumn.display({
          id: index.toString(),
          header: header,
          cell: ({ row }) => row.original[index],
        });
      },
    );
    const table = useReactTable({
      data: rows,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });
    const { theme } = useTheme();
    const themeVars = theme === "light" ? lightModeVars : darkModeVars;
    return (
      <div style={{ width: "100%", ...themeVars }}>
        {
          React.useState(() => {
            return (
              <div className="w-full">
                <AutoSizer
                  style={{ width: "100%" }}
                >
                  <ReactTanstackTableUi
                    table={table}
                    skin={{
                      ...TailwindSkin,
                      headerRowHeight: 32,
                      rowHeight: 32,
                    }}
                    autoCrushColumns
                    crushMinSizeBy="both"
                    fillAvailableSpaceAfterCrush
                    scrollbarWidth={20}
                  />
                </AutoSizer>
              </div>
            );
          })[0]
        }
      </div>
    );
  }),
};

// Render the application
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <MDXProvider components={components}>
        <RouterProvider router={router} />
      </MDXProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
