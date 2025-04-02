import React from "react";


export const CellAvatar: React.FC<{
  src: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
}> = ({ src, alt = "", size = "md" }) => {
  const sizeClass = {
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass[size]} rounded-full bg-gray-50 dark:bg-gray-800`} />
  );
};
