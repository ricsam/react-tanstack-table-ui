import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/skins/chadcn/demo")({
  component: RouteComponent,
  staticData: {
    layout: "full",
  },
});

function RouteComponent() {
  return (
    <div className="w-full h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <iframe
        src={"https://rttui-chadcn-registry.vercel.app/"}
        className="w-full h-full"
        title={`Chadcn theme`}
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    </div>
  );
}
