import { Link } from "@tanstack/react-router";
import React from "react";

const skins = [
  {
    name: "Material UI skin",
    description:
      "The Material UI skin is a skin that is designed to work with the core package. It is a skin that is designed to work with the Material UI library.",
    link: "/skins/mui",
  },
  {
    name: "Tailwind skin",
    description:
      "The Tailwind skin is a skin that is designed to work with the core package. It is a skin that is designed to work with the Tailwind CSS library.",
    link: "/skins/tailwind",
  },
  {
    name: "Bleu skin",
    description:
      "The Bleu skin is a skin that is designed to work with the core package. It is a skin that is designed to work with the Bleu library.",
    link: "/skins/bleu",
  },
  {
    name: "Default skin",
    description:
      "The Default skin is a skin that is designed to work with the core package. It is a skin that is designed to work with the Default library.",
    link: "/skins/default",
  },
];

export function SkinsLandingPage() {
  return (
    <div className="prose max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1>Skins</h1>

      <p>
        React TanStack Table UI comes with a default skin that is designed to
        work with the core package. However, you can also use other skins that
        are designed to work with the core package.
      </p>

      {skins.map((skin) => (
        <React.Fragment key={skin.link}>
          <h2>
            <Link to={skin.link}>{skin.name}</Link>
          </h2>
          <p>{skin.description}</p>
        </React.Fragment>
      ))}
    </div>
  );
}
