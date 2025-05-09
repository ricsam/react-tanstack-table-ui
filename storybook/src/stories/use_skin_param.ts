import { useArgs } from "@storybook/client-api";
import { useEffect, useState } from "react";

type SkinString = "core" | "bleu" | "tailwind" | "mui";

const validSkins: Set<string> = new Set(["core", "bleu", "tailwind", "mui"]);

const getSkinFromUrl = (frameWindow: Window) => {
  const params = new URLSearchParams(
    frameWindow.location.hash.replace("#", ""),
  );
  const skin = params.get("sb_skin");
  if (skin && validSkins.has(skin)) {
    return skin as SkinString;
  }
};

const setSkinInUrl = (frameWindow: Window, skin: SkinString) => {
  const params = new URLSearchParams(
    frameWindow.location.hash.replace("#", ""),
  );
  params.set("sb_skin", skin);
  window.location.hash = "#" + params.toString();
  //   frameWindow.history.replaceState(
  //     {},
  //     "",
  //     frameWindow.location.pathname +
  //       "?" +
  //       params.toString() +
  //       frameWindow.location.hash,
  //   );
};

const storeSkin = (currentWindow: Window, skin: SkinString) => {
  setSkinInUrl(currentWindow, skin);
  currentWindow.localStorage.setItem("sb_skin", skin);
};
// Define the expected return type for useMemo
type FrameInfo = {
  skinFromUrl: SkinString | undefined;
  skinFromLs: SkinString | undefined;
};

const getFrameInfo = (): FrameInfo => {
  const initialWindow: Window = window;

  let frameWindow: Window = initialWindow;
  let i = 0;

  const parseLs = (frameWindow: Window) => {
    const lsItem = frameWindow.localStorage.getItem("sb_skin");
    if (lsItem && validSkins.has(lsItem)) {
      return lsItem as SkinString;
    }
    return undefined;
  };
  let skinFromLs = parseLs(frameWindow);
  let skinFromUrl = getSkinFromUrl(frameWindow);
  // Use a standard function declaration for easier typing with recursion
  function findRelevantFrame(): FrameInfo {
    i++;
    skinFromUrl = getSkinFromUrl(frameWindow);
    skinFromLs = skinFromLs ?? parseLs(frameWindow);
    if (skinFromUrl) {
      return {
        skinFromUrl,
        skinFromLs,
      }; // Found it
    }

    if (i > 10) {
      // Safety break or Top window reached
      return {
        skinFromUrl,
        skinFromLs,
      };
    }

    // Go up one level
    frameWindow = frameWindow.parent;
    return findRelevantFrame(); // Recurse
  }
  return findRelevantFrame();
};

export const useSkinParam = (): SkinString => {
  const [{ skin: propSkin }, updateArgs] = useArgs<{ skin?: SkinString }>();

  // Find the search params (searching up the hierarchy for 'path')
  const { skinFromUrl, skinFromLs } = getFrameInfo();
  console.log({
    skinFromUrl,
    skinFromLs,
  });

  const skinFromStorage = skinFromUrl ?? skinFromLs ?? "core";
  const [updatedSkin, setUpdatedSkin] = useState(skinFromStorage);

  const [listenForUpdates, setListenForUpdates] = useState(false);

  useEffect(() => {
    updateArgs({ skin: skinFromStorage });
    storeSkin(window, skinFromStorage);
    setListenForUpdates(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (listenForUpdates && propSkin && propSkin !== updatedSkin) {
      setUpdatedSkin(propSkin);
      storeSkin(window, propSkin);
    }
  }, [listenForUpdates, propSkin, updatedSkin]);

  // Return the skin from args. Provide a default fallback.
  return updatedSkin;
};
