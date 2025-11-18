import { useMatches } from "@tanstack/react-router";

type Example = {
  id: string;
  title: string;
  description: string;
  dirName: string;
  mainFile: string;
};

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    example?: Example;
  }
}

export function PreviewExample() {
  const matches = useMatches();

  let example: Example | undefined;

  matches.forEach((match) => {
    example = match.staticData?.example;
  });

  if (!example) {
    throw new Error("Example not found");
  }

  const distUrl = `https://rttui-docs.vercel.app/static_examples/${example.dirName}/index.html`;

  return (
    <div className="w-full h-screen overflow-hidden">
      <iframe
        src={distUrl}
        className="w-full h-full"
        title={example.title}
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      ></iframe>
    </div>
  );
}

