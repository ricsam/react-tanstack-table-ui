import { DocsLayout } from "@/layouts/DocsLayout";
import { RootLayout } from "@/layouts/RootLayout";
import { APIPage } from "@/pages/api/Index";
import { GettingStartedPage } from "@/pages/docs/GettingStarted";
import { DocsIndexPage } from "@/pages/docs/Index";
import { InstallationPage } from "@/pages/docs/Installation";
import { QuickStartPage } from "@/pages/docs/QuickStart";
import { ExamplesPage } from "@/pages/examples/Index";
import { StaticExample } from "@/pages/examples/StaticExample";
import { HomePage } from "@/pages/Home";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import { examples } from "@/data/examples";

// Skins pages
import { DefaultSkinPage } from "@/pages/skins/DefaultSkin";
import { AnoccaSkinPage } from "@/pages/skins/AnoccaSkin";
import { MuiSkinPage } from "@/pages/skins/MuiSkin";
import { TailwindSkinPage } from "@/pages/skins/TailwindSkin";
import { TailwindComponentsPage } from "@/pages/skins/TailwindComponents";

// Core concepts pages
import { ColumnAutoSizingPage } from "@/pages/core-concepts/ColumnAutoSizing";
import { TableAutoSizingPage } from "@/pages/core-concepts/TableAutoSizing";
import { ToggleColPinningPage } from "@/pages/core-concepts/ToggleColPinning";
import { ToggleRowPinningPage } from "@/pages/core-concepts/ToggleRowPinning";
import { HeaderGroupsPage } from "@/pages/core-concepts/HeaderGroups";
import { AddResizerPage } from "@/pages/core-concepts/AddResizer";

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

// Installation page
export const installationRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "installation",
  component: InstallationPage,
});

// Quick start page
export const quickStartRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "quickstart",
  component: QuickStartPage,
});

// Skins routes
export const skinsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "skins",
  component: DocsLayout,
});

export const defaultSkinRoute = createRoute({
  getParentRoute: () => skinsRoute,
  path: "default",
  component: DefaultSkinPage,
});

export const anoccaSkinRoute = createRoute({
  getParentRoute: () => skinsRoute,
  path: "anocca",
  component: AnoccaSkinPage,
});

export const muiSkinRoute = createRoute({
  getParentRoute: () => skinsRoute,
  path: "mui",
  component: MuiSkinPage,
});

export const tailwindSkinRoute = createRoute({
  getParentRoute: () => skinsRoute,
  path: "tailwind",
  component: TailwindSkinPage,
});

export const tailwindComponentsRoute = createRoute({
  getParentRoute: () => skinsRoute,
  path: "tailwind/components",
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

// Create the route tree using the routes
export const routeTree = rootRoute.addChildren([
  homeRoute,
  docsRoute.addChildren([
    docsIndexRoute,
    gettingStartedRoute,
    installationRoute,
    quickStartRoute,
  ]),
  skinsRoute.addChildren([
    defaultSkinRoute,
    anoccaSkinRoute,
    muiSkinRoute,
    tailwindSkinRoute,
    tailwindComponentsRoute,
  ]),
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
]);
