import React from "react";
import { useListenToTableUpdate } from "../../utils";
import { VirtualCellContext } from "../contexts/VirtualCellContext";
import { VirtualHeaderCellContext } from "../contexts/VirtualHeaderCellContext";

export const useColRef = () => {
  const headerContext = React.useContext(VirtualHeaderCellContext);
  const cellContext = React.useContext(VirtualCellContext);

  if (!headerContext && !cellContext) {
    throw new Error("VirtualHeaderContext or VirtualCellContext not found");
  }
  const vheader = headerContext ?? cellContext?.vheader;
  const header = vheader?.header;
  if (!header || !vheader) {
    throw new Error("VirtualHeaderContext or VirtualCellContext not found");
  }
  const getVal = () => {
    const headerInstance = header();
    const val = {
      header: headerInstance,
      vheader,
      column: headerInstance.column,
    };
    return val;
  };
  const initialVal = getVal();
  const ref = React.useRef(initialVal);
  ref.current = initialVal;

  useListenToTableUpdate(() => {
    ref.current = getVal();
  });

  return ref;
};
