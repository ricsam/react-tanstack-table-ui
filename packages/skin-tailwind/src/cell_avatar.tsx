import { CellAvatarProps } from "@rttui/core";
import React from "react";

export const CellAvatar: React.FC<CellAvatarProps> = ({
  src,
  alt = "",
  size = "md",
}) => {
  const sizeClass = {
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass[size]} rounded-full bg-gray-50 dark:bg-gray-800`}
    />
  );
};
