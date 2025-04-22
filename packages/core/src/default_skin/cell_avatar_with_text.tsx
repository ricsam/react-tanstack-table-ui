import React from "react";
import { CellAvatar, CellAvatarProps } from "./cell_avatar";
import { CellTextBold } from "./cell_text_bold";

export type CellAvatarWithTextProps = CellAvatarProps & {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
};

export const CellAvatarWithText: React.FC<CellAvatarWithTextProps> = ({
  src,
  alt = "",
  size = "md",
  primary,
  secondary,
  fallback,
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <CellAvatar src={src} alt={alt} size={size} fallback={fallback} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <CellTextBold>{primary}</CellTextBold>
        {secondary && (
          <span
            style={{
              fontSize: "var(--table-text-size, 0.75rem)",
              color: "var(--table-secondary-text, #6b7280)",
            }}
          >
            {secondary}
          </span>
        )}
      </div>
    </div>
  );
};
