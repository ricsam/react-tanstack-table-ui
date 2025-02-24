import { Row } from "@tanstack/react-table";

export function getFlatIndex(row: Row<any>) {
  let index = row.index;
  let parent = row.getParentRow();
  while (parent) {
    index += 1; // for the parent row
    index += parent.index;
    parent = parent.getParentRow();
  }
  return index;
}
