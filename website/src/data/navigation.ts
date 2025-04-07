import { examples } from "./examples";

interface NavLinkItem {
  title: string;
  path: string;
}

interface NavGroupItem {
  title: string;
  children: (NavLinkItem | NavGroupItem)[];
}

export type NavItem = NavLinkItem | NavGroupItem;

export const navigation: NavItem[] = [
  {
    title: "Getting Started",
    children: [
      { title: "Introduction", path: "/docs/getting-started" },
      { title: "Options", path: "/docs/options" },
    ],
  },
  {
    title: "Core Concepts",
    children: [
      { title: "Column Auto Sizing", path: "/core-concepts/column-auto-sizing" },
      { title: "Table Auto Sizing", path: "/core-concepts/table-auto-sizing" },
      { title: "Toggle Column Pinning", path: "/core-concepts/toggle-col-pinning" },
      { title: "Toggle Row Pinning", path: "/core-concepts/toggle-row-pinning" },
      { title: "Header Groups", path: "/core-concepts/header-groups" },
      { title: "Adding Resizers", path: "/core-concepts/add-resizer" },
    ],
  },
  {
    title: "Skins",
    children: [
      { title: "Default Skin", path: "/skins/default" },
      { 
        title: "Anocca Skin", 
        children: [
          { title: "Setup", path: "/skins/anocca" },
          { title: "Storybook", path: "/skins/anocca/storybook" },
        ]
      },
      { 
        title: "MUI Skin", 
        children: [
          { title: "Setup", path: "/skins/mui" },
          { title: "Storybook", path: "/skins/mui/storybook" },
        ]
      },
      { 
        title: "Tailwind Skin", 
        children: [
          { title: "Setup", path: "/skins/tailwind" },
          { title: "Components", path: "/skins/tailwind/components" },
          { title: "Storybook", path: "/skins/tailwind/storybook" },
        ]
      },
    ],
  },
  {
    title: "Examples",
    children: Object.values(examples).map(example => ({
      title: example.title,
      path: `/examples/${example.id}`,
    })),
  },
  {
    title: "API Reference",
    children: [
      { title: "API Reference", path: "/api" },
    ],
  },
]; 