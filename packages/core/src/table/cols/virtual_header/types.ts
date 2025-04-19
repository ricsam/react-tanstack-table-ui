import { Header } from "@tanstack/react-table";

export type HeaderIndex = {
  headerIndex: number;
  groupIndex: number;
  columnId: string;
  headerId: string;
  groupId: string;
  type: "header" | "footer";
  header: Header<any, unknown>;
};
