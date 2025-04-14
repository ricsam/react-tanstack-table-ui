import React from "react";
import { TablePropsContext, TablePropsContextType } from "../contexts/TablePropsContext";

export const useTablePropsContext = (): TablePropsContextType => {
  const context = React.useContext(TablePropsContext);
  if (!context) {
    throw new Error(
      "useTablePropsContext must be used within a TablePropsProvider",
    );
  }
  return context;
};
