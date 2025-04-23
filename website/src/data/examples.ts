// Define the type for an individual example
export type Example = {
  id: string;
  title: string;
  description: string;
  path: string;
  dirName: string;
  mainFile: string;
};

// Define all examples in a single place
export const examples: Record<string, Example> = {
  minimal: {
    id: "minimal",
    title: "Minimal Example",
    description: "A minimal example of how to use the library.",
    path: "/examples/minimal",
    dirName: "minimal",
    mainFile: "src/app.tsx",
  },
  small: {
    id: "small",
    title: "Small Example",
    description: "A small example of how to use the library.",
    path: "/examples/small",
    dirName: "small",
    mainFile: "src/app.tsx",
  },
  full: {
    id: "full",
    title: "Full Example",
    description: "A full example of how to use the library.",
    path: "/examples/full",
    dirName: "full",
    mainFile: "src/app.tsx",
  },
  skins: {
    id: "skins",
    title: "Custom Skins Example",
    description: "Explore different skin options including Material UI and Bleu themes.",
    path: "/examples/skins",
    dirName: "skins",
    mainFile: "src/app.tsx",
  },
};

// Also export as an array for easier iteration
export const examplesArray = Object.values(examples); 