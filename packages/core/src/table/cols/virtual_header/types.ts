import { Header } from "@tanstack/react-table";

export type HeaderIndex = {
  headerIndex: number;
  groupIndex: number;
  columnId: string;
  headerId: string;
  header: Header<any, unknown>;
};
