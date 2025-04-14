import React from "react";
import { CellAvatar } from "./CellAvatar";


export const CellAvatarWithText: React.FC<{
  src: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  text: string;
}> = ({ src, alt = "", size = "md", text }) => {
  return (
    <div className="flex items-center gap-x-4">
      <CellAvatar src={src} alt={alt} size={size} />
      <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
        {text}
      </div>
    </div>
  );
};
