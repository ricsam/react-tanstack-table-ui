import React from "react";

// Define the props for CellLink, extending standard Anchor attributes
interface CellLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string; // The URL the link points to (required)
  children: React.ReactNode; // The visible content of the link (required)
  srText?: string; // Additional text for screen readers
}

// Implement the CellLink component for the Bleu skin
export const CellLink: React.FC<CellLinkProps> = ({
  href,
  children,
  srText,
  style, // Allow consuming style prop
  ...props // Pass through other anchor attributes (target, rel, etc.)
}) => {
  // Basic link styling - Bleu will likely provide specific link styles
  const baseStyle: React.CSSProperties = {
    fontSize: "0.875rem", // Equivalent to text-sm
    fontWeight: 500, // Equivalent to font-medium
    color: "#4f46e5", // Equivalent to text-indigo-600 (Placeholder)
    textDecoration: "none", // Common practice, hover effect can add underline
    cursor: "pointer",
    // Add hover effect (though direct inline hover isn't possible)
    // Bleu would likely use CSS classes for this
  };

  // Style for screen reader only text
  const srOnlyStyle: React.CSSProperties = {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  };

  return (
    <a href={href} style={{ ...baseStyle, ...style }} {...props}>
      {children}
      {srText && <span style={srOnlyStyle}>, {srText}</span>}
    </a>
  );
};
