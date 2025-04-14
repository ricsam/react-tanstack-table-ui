import React from "react";
import { TablePropsContext, TablePropsContextType } from "../contexts/table_props_context";

export const useTablePropsContext = (): TablePropsContextType => {
  const context = React.useContext(TablePropsContext);
  if (!context) {
    throw new Error(
      "useTablePropsContext must be used within a TablePropsProvider",
    );
  }
  return context;
};
