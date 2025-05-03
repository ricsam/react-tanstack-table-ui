"use client";
import React from "react";
import { RttuiRow } from "../types";

export const VirtualRowContext = React.createContext<
  undefined | (() => RttuiRow | undefined)
>(undefined);
