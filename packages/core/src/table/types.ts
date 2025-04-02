import { Header, HeaderGroup } from "@tanstack/react-table";

export type PinPos = false | "start" | "end";
export type CombinedHeaderGroup = {
  id: string;
  headers: Header<any, unknown>[];
  headerGroups: HeaderGroup<any>[];
};
