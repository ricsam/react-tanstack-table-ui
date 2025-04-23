import { DocsLayout } from "@/layouts/docs_layout";
import { RootLayout } from "@/layouts/root_layout";
import { APIPage } from "@/pages/api/index";
import { GettingStartedPage } from "@/pages/docs/getting_started";
import { DocsIndexPage } from "@/pages/docs/index";
import { OptionsPage } from "@/pages/docs/options";
import { ExamplesPage } from "@/pages/examples/index";
import { StaticExample } from "@/pages/examples/static_example";
import { HomePage } from "@/pages/home";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import { examples } from "@/data/examples";

// Skins pages
import { DefaultSkinPage } from "@/pages/skins/default_skin";
import { BleuSkinPage } from "@/pages/skins/bleu_skin";
import { BleuStorybookPage } from "@/pages/skins/bleu_storybook";
import { MuiSkinPage } from "@/pages/skins/mui_skin";
import { MuiStorybookPage } from "@/pages/skins/mui_storybook";
import { TailwindSkinPage } from "@/pages/skins/tailwind_skin";
import { TailwindStorybookPage } from "@/pages/skins/tailwind_storybook";
import { TailwindComponentsPage } from "@/pages/skins/tailwind_components";

// Core concepts pages
import { ColumnAutoSizingPage } from "@/pages/core-concepts/column_auto_sizing";
import { TableAutoSizingPage } from "@/pages/core-concepts/table_auto_sizing";
import { ToggleColPinningPage } from "@/pages/core-concepts/toggle_col_pinning";
import { ToggleRowPinningPage } from "@/pages/core-concepts/toggle_row_pinning";
import { HeaderGroupsPage } from "@/pages/core-concepts/header_groups";
import { AddResizerPage } from "@/pages/core-concepts/add_resizer";
import { SkinsLandingPage } from "@/pages/skins/skins_landing_page";

// Blog posts
import { BlogComponent } from "@/blog/architecture_blog_post";

// Root route with the main layout
export const rootRoute = createRootRoute({
  component: RootLayout,
});

// Home page
export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

// Docs layout route
export const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "docs",
  component: DocsLayout,
});

// Docs index page
export const docsIndexRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "/",
  component: DocsIndexPage,
});

// Getting started page
export const gettingStartedRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "getting-started",
  component: GettingStartedPage,
});

// Options page
export const optionsRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "options",
  component: OptionsPage,
});

// Skins routes
export const skinsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "skins",
  component: SkinsLandingPage,
});

export const defaultSkinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "skins/default",
  component: DefaultSkinPage,
});

export const bleuSkinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "skins/bleu",
  component: BleuSkinPage,
});

export const bleuStorybookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "skins/bleu/storybook",
  component: BleuStorybookPage,
});

export const muiSkinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "skins/mui",
  component: MuiSkinPage,
});

export const muiStorybookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "skins/mui/storybook",
  component: MuiStorybookPage,
});

export const tailwindSkinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "skins/tailwind",
  component: TailwindSkinPage,
});

export const tailwindStorybookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "skins/tailwind/storybook",
  component: TailwindStorybookPage,
});

export const tailwindComponentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "skins/tailwind/components",
  component: TailwindComponentsPage,
});

// Core concepts routes
export const coreConcepts = createRoute({
  getParentRoute: () => rootRoute,
  path: "core-concepts",
  component: DocsLayout,
});

export const columnAutoSizingRoute = createRoute({
  getParentRoute: () => coreConcepts,
  path: "column-auto-sizing",
  component: ColumnAutoSizingPage,
});

export const tableAutoSizingRoute = createRoute({
  getParentRoute: () => coreConcepts,
  path: "table-auto-sizing",
  component: TableAutoSizingPage,
});

export const toggleColPinningRoute = createRoute({
  getParentRoute: () => coreConcepts,
  path: "toggle-col-pinning",
  component: ToggleColPinningPage,
});

export const toggleRowPinningRoute = createRoute({
  getParentRoute: () => coreConcepts,
  path: "toggle-row-pinning",
  component: ToggleRowPinningPage,
});

export const headerGroupsRoute = createRoute({
  getParentRoute: () => coreConcepts,
  path: "header-groups",
  component: HeaderGroupsPage,
});

export const addResizerRoute = createRoute({
  getParentRoute: () => coreConcepts,
  path: "add-resizer",
  component: AddResizerPage,
});

// Examples index page
export const examplesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "examples",
  component: ExamplesPage,
});

// Create example routes dynamically based on the examples data
const exampleRoutes = Object.values(examples).map((example) => {
  return createRoute({
    getParentRoute: () => rootRoute,
    path: `examples/${example.id}`,
    component: StaticExample,
    staticData: {
      example: {
        title: example.title,
        description: example.description,
        dirName: example.dirName,
        mainFile: example.mainFile,
      },
    },
  });
});

// API reference page
export const apiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "api",
  component: APIPage,
});

// Blog Routes
export const blogArchitectureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/architecture",
  component: BlogComponent,
});

// Create the route tree using the routes
export const routeTree = rootRoute.addChildren([
  homeRoute,
  docsRoute.addChildren([docsIndexRoute, gettingStartedRoute, optionsRoute]),
  skinsRoute,
  defaultSkinRoute,
  bleuSkinRoute,
  bleuStorybookRoute,
  muiSkinRoute,
  muiStorybookRoute,
  tailwindSkinRoute,
  tailwindStorybookRoute,
  tailwindComponentsRoute,
  coreConcepts.addChildren([
    columnAutoSizingRoute,
    tableAutoSizingRoute,
    toggleColPinningRoute,
    toggleRowPinningRoute,
    headerGroupsRoute,
    addResizerRoute,
  ]),
  examplesRoute,
  ...exampleRoutes,
  apiRoute,
  blogArchitectureRoute,
]);
