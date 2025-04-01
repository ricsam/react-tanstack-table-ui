import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { RootLayout } from '@/layouts/RootLayout';
import { HomePage } from '@/pages/Home';
import { DocsLayout } from '@/layouts/DocsLayout';
import { DocsIndexPage } from '@/pages/docs/Index';
import { GettingStartedPage } from '@/pages/docs/GettingStarted';
import { InstallationPage } from '@/pages/docs/Installation';
import { QuickStartPage } from '@/pages/docs/QuickStart';
import { ExamplesPage } from '@/pages/examples/Index';
import { BasicExample } from '@/pages/examples/BasicExample';
import { VirtualExample } from '@/pages/examples/VirtualExample';
import { SkinsExample } from '@/pages/examples/SkinsExample';
import { FilteringExample } from '@/pages/examples/FilteringExample';
import { CustomizationExample } from '@/pages/examples/CustomizationExample';
import { APIPage } from '@/pages/api/Index';

// Root route with the main layout
export const rootRoute = createRootRoute({
  component: RootLayout,
});

// Home page
export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

// Docs layout route
export const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'docs',
  component: DocsLayout,
});

// Docs index page
export const docsIndexRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: '/',
  component: DocsIndexPage,
});

// Getting started page
export const gettingStartedRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: 'getting-started',
  component: GettingStartedPage,
});

// Installation page
export const installationRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: 'installation',
  component: InstallationPage,
});

// Quick start page
export const quickStartRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: 'quickstart',
  component: QuickStartPage,
});

// Examples index page
export const examplesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'examples',
  component: ExamplesPage,
});

// Individual example routes
export const basicExampleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'examples/basic',
  component: BasicExample,
});

export const virtualExampleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'examples/virtual',
  component: VirtualExample,
});

export const skinsExampleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'examples/skins',
  component: SkinsExample,
});

export const filteringExampleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'examples/filtering',
  component: FilteringExample,
});

export const customizationExampleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'examples/customization',
  component: CustomizationExample,
});

// API reference page
export const apiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'api',
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
  examplesRoute,
  basicExampleRoute,
  virtualExampleRoute,
  skinsExampleRoute,
  filteringExampleRoute,
  customizationExampleRoute,
  apiRoute,
]); 