interface StorybookEmbedProps {
  skin: "mui" | "tailwind" | "anocca";
}

export function StorybookEmbed({ skin }: StorybookEmbedProps) {
  const storybookUrl = `https://rttui-docs.vercel.app/static_sb/skins/index.html?path=/docs/reacttanstacktableui--docs`;

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <iframe
        src={storybookUrl}
        className="w-full h-full"
        title={`${skin.charAt(0).toUpperCase() + skin.slice(1)} Skin Storybook`}
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    </div>
  );
}
