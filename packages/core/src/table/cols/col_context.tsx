import React from "react";
import { VirtualHeaderGroup } from "./header_group";

type Position = { x: number; y: number };

type ColContextType = {
  onDragStart: (headerId: string) => void;
  setIsDragging: (props: {
    headerId: string;
    mouseStart: Position;
    itemPos: Position;
  }) => void;
  footerGroups: VirtualHeaderGroup[];
  headerGroups: VirtualHeaderGroup[];
  mainHeaderGroup: VirtualHeaderGroup;
};

export const ColContext = React.createContext<ColContextType | undefined>(
  undefined,
);

export const useColContext = () => {
  const context = React.useContext(ColContext);
  if (!context) {
    throw new Error("useColContext must be used within a ColProvider");
  }
  return context;
};
