import { examples } from "./examples";

interface NavLinkItem {
  title: string;
  path: string;
}

interface NavGroupItem {
  title: string;
  children: (NavLinkItem | NavGroupItem)[];
  defaultExpanded?: boolean;
}

export type NavItem = NavLinkItem | NavGroupItem;

export const navigation: NavItem[] = [
  {
    title: "Getting Started",
    path: "/docs/getting-started",
  },
  {
    title: "API",
    path: "/docs/api",
  },
  {
    title: "Skins",
    children: [
      {
        title: "Introduction",
        path: "/skins/",
      },
      {
        title: "Default",
        children: [
          { title: "Setup", path: "/skins/default" },
          { title: "Storybook", path: "/skins/default/storybook" },
        ],
      },
      {
        title: "Bleu",
        children: [
          { title: "Setup", path: "/skins/bleu" },
          { title: "Storybook", path: "/skins/bleu/storybook" },
        ],
      },
      {
        title: "MUI",
        children: [
          { title: "Setup", path: "/skins/mui" },
          { title: "Storybook", path: "/skins/mui/storybook" },
        ],
      },
      {
        title: "Tailwind",
        children: [
          { title: "Setup", path: "/skins/tailwind" },
          { title: "Demo", path: "/skins/tailwind/demo" },
          { title: "Storybook", path: "/skins/tailwind/storybook" },
        ],
      },
    ],
    defaultExpanded: true,
  },
  {
    title: "Examples",
    children: Object.values(examples).map((example) => ({
      title: example.title,
      path: `/examples/${example.id}`,
    })),
  },
  {
    title: "Roadmap",
    path: "/roadmap",
  },
];
