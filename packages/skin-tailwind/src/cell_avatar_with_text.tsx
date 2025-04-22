import React from "react";
import { CellAvatar } from "./cell_avatar";
import { CellAvatarWithTextProps } from "@rttui/core";

export const CellAvatarWithText: React.FC<CellAvatarWithTextProps> = ({
  src,
  alt = "",
  size = "md",
  primary,
  secondary,
  fallback,
}) => {
  return (
    <div className="flex items-center gap-x-4">
      <CellAvatar src={src} alt={alt} size={size} fallback={fallback} />
      <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
        {primary}
      </div>
      {secondary && (
        <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
          {secondary}
        </div>
      )}
    </div>
  );
};
