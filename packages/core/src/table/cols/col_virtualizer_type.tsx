import { VirtualHeaderGroup } from "../types";

type Position = { x: number; y: number };

export type ColVirtualizerType = {
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
