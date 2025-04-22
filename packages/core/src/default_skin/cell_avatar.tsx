import React from "react";

export type CellAvatarProps = {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  fallback?: string;
};

export const CellAvatar: React.FC<CellAvatarProps> = ({
  src,
  alt = "",
  size = "md",
  fallback,
}) => {
  const sizeMap = {
    sm: 24, // Equivalent to size-6 in Tailwind (1.5rem)
    md: 32, // Equivalent to size-8 in Tailwind (2rem)
    lg: 40, // Equivalent to size-10 in Tailwind (2.5rem)
  };
  const avatarSize = sizeMap[size];
  
  const [error, setError] = React.useState(!src);

  const getFallbackInitials = () => {
    if (fallback) return fallback;
    if (!alt) return "";

    return alt
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div
      style={{
        width: `${avatarSize}px`,
        height: `${avatarSize}px`,
        borderRadius: "9999px",
        overflow: "hidden",
        backgroundColor: error ? "var(--table-avatar-bg, #e5e7eb)" : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--table-avatar-text, #6b7280)",
        fontSize: `${avatarSize / 2.5}px`,
        fontWeight: "var(--table-bold-weight, 500)",
      }}
    >
      {!error ? (
        <img
          src={src}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setError(true)}
        />
      ) : (
        getFallbackInitials()
      )}
    </div>
  );
};
