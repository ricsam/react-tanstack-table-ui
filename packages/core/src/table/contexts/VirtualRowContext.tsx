import React from "react";
import { VirtualRow } from "../types";

export const VirtualRowContext = React.createContext<undefined | VirtualRow>(
  undefined,
);
