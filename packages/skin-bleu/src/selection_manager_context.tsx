/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { SelectionManager } from "@ricsam/selection-manager";

const SelectionManagerContext = createContext<SelectionManager | null>(
  null,
);
export const useSelectionManagerCls = () => {
  const selectionManager = useContext(SelectionManagerContext);
  if (!selectionManager) {
    throw new Error("SelectionManager not found");
  }
  return selectionManager;
};
export const SelectionManagerProvider = ({
  children,
  selectionManager,
}: {
  children: React.ReactNode;
  selectionManager: SelectionManager;
}) => {
  return (
    <SelectionManagerContext.Provider value={selectionManager}>
      {children}
    </SelectionManagerContext.Provider>
  );
};
